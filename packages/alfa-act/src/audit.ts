import type { Hashable } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { List } from "@siteimprove/alfa-list";
import { None } from "@siteimprove/alfa-option";
import type { Performance } from "@siteimprove/alfa-performance";

import { Cache } from "./cache.js";
import type { Oracle } from "./oracle.js";
import type { Outcome } from "./outcome.js";
import type { Question } from "./question.js";
import type { Rule } from "./rule.js";

/**
 * @public
 * * I: type of Input for rules
 * * T: possible types of test targets
 * * Q: questions' metadata type
 * * S: possible types of questions' subject.
 */
export class Audit<
  I,
  T extends Hashable,
  Q extends Question.Metadata = {},
  S = T,
> {
  public static of<
    I,
    T extends Hashable,
    Q extends Question.Metadata = {},
    S = T,
  >(
    input: I,
    rules: Iterable<Rule<I, T, Q, S>>,
    oracle: Oracle<I, T, Q, S> = () => None,
  ): Audit<I, T, Q, S> {
    return new Audit(input, List.from(rules), oracle);
  }

  private readonly _input: I;
  private readonly _rules: List<Rule<I, T, Q, S>>;
  private readonly _oracle: Oracle<I, T, Q, S>;

  protected constructor(
    input: I,
    rules: List<Rule<I, T, Q, S>>,
    oracle: Oracle<I, T, Q, S>,
  ) {
    this._input = input;
    this._rules = rules;
    this._oracle = oracle;
  }

  public evaluate(
    performance?: Performance<Rule.Event<I, T, Q, S>>,
  ): Iterable<Outcome<I, T, Q, S>> {
    const outcomes = Cache.empty();

    const result: Array<Outcome<I, T, Q, S>> = [];

    for (const rule of this._rules) {
      for (const outcome of rule.evaluate(
        this._input,
        this._oracle,
        outcomes,
        performance,
      )) {
        result.push(outcome);
      }
    }

    return result;
  }
}
