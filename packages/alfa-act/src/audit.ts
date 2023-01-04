import { Future } from "@siteimprove/alfa-future";
import { Hashable } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { List } from "@siteimprove/alfa-list";
import { None } from "@siteimprove/alfa-option";
import { Performance } from "@siteimprove/alfa-performance";

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
export class Audit<I, T extends Hashable, Q = never, S = T> {
  public static of<I, T extends Hashable, Q = never, S = T>(
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
    performance?: Performance<Rule.Event<I, T, Q, S>>
  ): Future<Iterable<Outcome<I, T, Q, S>>> {
    const outcomes = Cache.empty();

    return Future.traverse(this._rules, (rule) =>
      rule.evaluate(this._input, this._oracle, outcomes, performance)
    ).map(Iterable.flatten);
  }
}
