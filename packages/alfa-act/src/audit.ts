import { Future } from "@siteimprove/alfa-future";
import { Iterable } from "@siteimprove/alfa-iterable";
import { List } from "@siteimprove/alfa-list";
import { None } from "@siteimprove/alfa-option";

import { Cache } from "./cache";
import { Oracle } from "./oracle";
import { Outcome } from "./outcome";
import { Rule } from "./rule";

export class Audit<I, T = unknown, Q = unknown> {
  public static of<I, T = unknown, Q = unknown>(
    input: I,
    oracle: Oracle<Q> = () => Future.now(None)
  ): Audit<I, T, Q> {
    return new Audit(input, oracle, List.empty());
  }

  private readonly _input: I;
  private readonly _oracle: Oracle<Q>;
  private readonly _rules: List<Rule<I, T, Q>>;

  private constructor(input: I, oracle: Oracle<Q>, rules: List<Rule<I, T, Q>>) {
    this._input = input;
    this._oracle = oracle;
    this._rules = rules;
  }

  public add(rule: Rule<I, T, Q>): Audit<I, T, Q> {
    return new Audit(this._input, this._oracle, this._rules.push(rule));
  }

  public evaluate(): Future<Iterable<Outcome<I, T, Q>>> {
    const outcomes = Cache.empty();

    return Future.traverse(this._rules, (rule) =>
      rule.evaluate(this._input, this._oracle, outcomes)
    ).map(Iterable.flatten);
  }
}
