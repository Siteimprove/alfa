import { Future } from "@siteimprove/alfa-future";
import { Iterable } from "@siteimprove/alfa-iterable";
import { List } from "@siteimprove/alfa-list";
import { None } from "@siteimprove/alfa-option";

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

  public evaluate(): Future<Iterable<Outcome<I, T, Q>>> {
    const outcomes = Cache.empty();

    return Future.traverse(this._rules, (rule) =>
      rule.evaluate(this._input, this._oracle, outcomes)
    ).map(Iterable.flatten);
  }
}
