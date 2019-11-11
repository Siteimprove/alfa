import { Iterable } from "@siteimprove/alfa-iterable";
import { List } from "@siteimprove/alfa-list";
import { None } from "@siteimprove/alfa-option";

import { Cache } from "./cache";
import { Oracle } from "./oracle";
import { Outcome } from "./outcome";
import { Rule } from "./rule";

export class Audit<I, T = never, Q = unknown> {
  public static of<I, Q = unknown>(
    input: I,
    oracle: Oracle<Q> = () => None
  ): Audit<I, never, Q> {
    return new Audit(input, oracle, List.empty());
  }

  private readonly input: I;
  private readonly oracle: Oracle<Q>;
  private readonly rules: List<Rule<I, T, Q>>;

  private constructor(input: I, oracle: Oracle<Q>, rules: List<Rule<I, T, Q>>) {
    this.input = input;
    this.oracle = oracle;
    this.rules = rules;
  }

  public add<U, R extends Q>(rule: Rule<I, U, R>): Audit<I, T | U, Q> {
    return new Audit(
      this.input,
      this.oracle,
      List.from<Rule<I, T | U, Q>>(this.rules).push(rule)
    );
  }

  public evaluate(): Iterable<Outcome<I, T, Q>> {
    const outcomes = Cache.empty();

    return Iterable.flatMap(this.rules, rule =>
      rule.evaluate(this.input, this.oracle, outcomes)
    );
  }
}
