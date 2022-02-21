import { Future } from "@siteimprove/alfa-future";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { List } from "@siteimprove/alfa-list";
import { None } from "@siteimprove/alfa-option";
import { Performance } from "@siteimprove/alfa-performance";

import * as json from "@siteimprove/alfa-json";

import { Cache } from "./cache";
import { Oracle } from "./oracle";
import { Outcome } from "./outcome";
import { Rule } from "./rule";

/**
 * @public
 * * I: type of Input for rules
 * * T: possible types of test targets
 * * Q: questions' metadata type
 * * S: possible types of questions' subject.
 */
export class Audit<I, T = unknown, Q = never, S = T> {
  public static of<I, T = unknown, Q = never, S = T>(
    input: I,
    rules: Iterable<Rule<I, T, Q, S>>,
    oracle: Oracle<I, T, Q, S> = () => Future.now(None)
  ): Audit<I, T, Q, S> {
    return new Audit(input, List.from(rules), oracle);
  }

  private readonly _input: I;
  private readonly _rules: List<Rule<I, T, Q, S>>;
  private readonly _oracle: Oracle<I, T, Q, S>;

  private constructor(
    input: I,
    rules: List<Rule<I, T, Q, S>>,
    oracle: Oracle<I, T, Q, S>
  ) {
    this._input = input;
    this._rules = rules;
    this._oracle = oracle;
  }

  public evaluate(
    performance?: Performance<Audit.Event<I, T, Q, S>>
  ): Future<Iterable<Outcome<I, T, Q, S>>> {
    const outcomes = Cache.empty();

    return Future.traverse(this._rules, (rule) => {
      let start: number | undefined;

      return Future.empty()
        .tee(() => {
          start = performance?.mark(Audit.start(rule)).start;
        })
        .flatMap(() => rule.evaluate(this._input, this._oracle, outcomes))
        .tee(() => {
          performance?.measure(Audit.end(rule), start);
        });
    }).map(Iterable.flatten);
  }
}

/**
 * @public
 */
export namespace Audit {
  export class Event<
    INPUT,
    TARGET,
    QUESTION,
    SUBJECT,
    TYPE extends Event.Type = Event.Type,
    NAME extends string = string
  > implements Serializable<Event.JSON<TYPE, NAME>>
  {
    public static of<
      INPUT,
      TARGET,
      QUESTION,
      SUBJECT,
      TYPE extends Event.Type,
      NAME extends string
    >(
      type: TYPE,
      rule: Rule<INPUT, TARGET, QUESTION, SUBJECT>,
      name: NAME
    ): Event<INPUT, TARGET, QUESTION, SUBJECT, TYPE, NAME> {
      return new Event(type, rule, name);
    }

    private readonly _type: TYPE;
    private readonly _rule: Rule<INPUT, TARGET, QUESTION, SUBJECT>;
    private readonly _name: NAME;

    constructor(
      type: TYPE,
      rule: Rule<INPUT, TARGET, QUESTION, SUBJECT>,
      name: NAME
    ) {
      this._type = type;
      this._rule = rule;
      this._name = name;
    }

    public get type(): TYPE {
      return this._type;
    }

    public get rule(): Rule<INPUT, TARGET, QUESTION, SUBJECT> {
      return this._rule;
    }

    public get name(): NAME {
      return this._name;
    }

    public toJSON(): Event.JSON<TYPE, NAME> {
      return {
        type: this._type,
        rule: this._rule.toJSON(),
        name: this._name,
      };
    }
  }

  export namespace Event {
    export type Type = "start" | "end";

    export interface JSON<T extends Type = Type, N extends string = string> {
      [key: string]: json.JSON;
      type: T;
      rule: Rule.JSON;
      name: N;
    }

    export function isEvent<
      INPUT,
      TARGET,
      QUESTION,
      SUBJECT,
      TYPE extends Event.Type = Event.Type,
      NAME extends string = string
    >(
      value: unknown
    ): value is Event<INPUT, TARGET, QUESTION, SUBJECT, TYPE, NAME> {
      return value instanceof Event;
    }
  }

  export const { of: event } = Event;

  export function start<I, T, Q, S>(
    rule: Rule<I, T, Q, S>
  ): Event<I, T, Q, S, "start", "rule"> {
    return Event.of("start", rule, "rule");
  }

  export function end<I, T, Q, S>(
    rule: Rule<I, T, Q, S>
  ): Event<I, T, Q, S, "end", "rule"> {
    return Event.of("end", rule, "rule");
  }

  export function startApplicability<I, T, Q, S>(
    rule: Rule<I, T, Q, S>
  ): Event<I, T, Q, S, "start", "applicability"> {
    return Event.of("start", rule, "applicability");
  }

  export function endApplicability<I, T, Q, S>(
    rule: Rule<I, T, Q, S>
  ): Event<I, T, Q, S, "end", "applicability"> {
    return Event.of("end", rule, "applicability");
  }

  export function startExpectation<I, T, Q, S>(
    rule: Rule<I, T, Q, S>
  ): Event<I, T, Q, S, "start", "expectation"> {
    return Event.of("start", rule, "expectation");
  }

  export function endExpectation<I, T, Q, S>(
    rule: Rule<I, T, Q, S>
  ): Event<I, T, Q, S, "end", "expectation"> {
    return Event.of("end", rule, "expectation");
  }
}
