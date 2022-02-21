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
    I,
    T,
    Q,
    S,
    N extends Event.Name = Event.Name,
    K extends Event.Kind = Event.Kind
  > implements Serializable<Event.JSON<N, K>>
  {
    public static of<I, T, Q, S, N extends Event.Name, K extends Event.Kind>(
      name: N,
      kind: K,
      rule: Rule<I, T, Q, S>
    ): Event<I, T, Q, S, N, K> {
      return new Event(name, kind, rule);
    }

    private readonly _name: N;
    private readonly _kind: K;
    private readonly _rule: Rule<I, T, Q, S>;

    constructor(event: N, kind: K, rule: Rule<I, T, Q, S>) {
      this._name = event;
      this._kind = kind;
      this._rule = rule;
    }

    public get name(): N {
      return this._name;
    }

    public get kind(): K {
      return this._kind;
    }

    public get rule(): Rule<I, T, Q, S> {
      return this._rule;
    }

    public toJSON(): Event.JSON<N, K> {
      return {
        name: this._name,
        kind: this._kind,
        rule: this._rule.toJSON(),
      };
    }
  }

  export namespace Event {
    export type Name = "start" | "end";
    export type Kind = "rule" | "applicability" | "expectation";

    export interface JSON<N extends Name = Name, K extends Kind = Kind> {
      [key: string]: json.JSON;
      name: N;
      kind: K;
      rule: Rule.JSON;
    }

    export function isEvent<I, T, Q, S, N extends Event.Name = Event.Name>(
      value: unknown
    ): value is Event<I, T, Q, S, N> {
      return value instanceof Event;
    }
  }

  export const { of: event } = Event;

  export function start<I, T, Q, S>(
    rule: Rule<I, T, Q, S>
  ): Event<I, T, Q, S, "start", "rule"> {
    return Event.of("start", "rule", rule);
  }

  export function end<I, T, Q, S>(
    rule: Rule<I, T, Q, S>
  ): Event<I, T, Q, S, "end", "rule"> {
    return Event.of("end", "rule", rule);
  }

  export function startApplicability<I, T, Q, S>(
    rule: Rule<I, T, Q, S>
  ): Event<I, T, Q, S, "start", "applicability"> {
    return Event.of("start", "applicability", rule);
  }

  export function endApplicability<I, T, Q, S>(
    rule: Rule<I, T, Q, S>
  ): Event<I, T, Q, S, "end", "applicability"> {
    return Event.of("end", "applicability", rule);
  }

  export function startExpectation<I, T, Q, S>(
    rule: Rule<I, T, Q, S>
  ): Event<I, T, Q, S, "start", "expectation"> {
    return Event.of("start", "expectation", rule);
  }

  export function endExpectation<I, T, Q, S>(
    rule: Rule<I, T, Q, S>
  ): Event<I, T, Q, S, "end", "expectation"> {
    return Event.of("end", "expectation", rule);
  }
}
