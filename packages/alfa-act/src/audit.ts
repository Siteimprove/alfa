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

export class Audit<I, T = unknown, Q = never> {
  public static of<I, T = unknown, Q = never>(
    input: I,
    rules: Iterable<Rule<I, T, Q>>,
    oracle: Oracle<Q> = () => Future.now(None)
  ): Audit<I, T, Q> {
    return new Audit(input, List.from(rules), oracle);
  }

  private readonly _input: I;
  private readonly _rules: List<Rule<I, T, Q>>;
  private readonly _oracle: Oracle<Q>;

  private constructor(input: I, rules: List<Rule<I, T, Q>>, oracle: Oracle<Q>) {
    this._input = input;
    this._rules = rules;
    this._oracle = oracle;
  }

  public evaluate(
    performance?: Performance<Audit.Event<I, T, Q>>
  ): Future<Iterable<Outcome<I, T, Q>>> {
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

export namespace Audit {
  export class Event<I, T, Q> implements Serializable<Event.JSON> {
    public static of<I, T, Q>(
      name: Event.Name,
      rule: Rule<I, T, Q>
    ): Event<I, T, Q> {
      return new Event(name, rule);
    }

    public static start<I, T, Q>(rule: Rule<I, T, Q>): Event<I, T, Q> {
      return new Event("start", rule);
    }

    public static end<I, T, Q>(rule: Rule<I, T, Q>): Event<I, T, Q> {
      return new Event("end", rule);
    }

    private readonly _name: Event.Name;
    private readonly _rule: Rule<I, T, Q>;

    private constructor(event: Event.Name, rule: Rule<I, T, Q>) {
      this._name = event;
      this._rule = rule;
    }

    public get name(): Event.Name {
      return this._name;
    }

    public get rule(): Rule<I, T, Q> {
      return this._rule;
    }

    public toJSON(): Event.JSON {
      return {
        name: this._name,
        rule: this._rule.toJSON(),
      };
    }
  }

  export namespace Event {
    export type Name = "start" | "end";

    export interface JSON {
      [key: string]: json.JSON;
      name: Name;
      rule: Rule.JSON;
    }
  }

  export const { of: event, start, end } = Event;
}
