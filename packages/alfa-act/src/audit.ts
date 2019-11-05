import { Branched } from "@siteimprove/alfa-branched";
import { Iterable } from "@siteimprove/alfa-iterable";
import { List } from "@siteimprove/alfa-list";
import { None } from "@siteimprove/alfa-option";

import { Cache } from "./cache";
import { Oracle } from "./oracle";
import { Outcome } from "./outcome";
import { Rule } from "./rule";

export class Audit<I, T = never, Q = unknown, B = never> {
  public static of<I, Q = unknown>(
    input: I,
    oracle: Oracle<Q> = () => None
  ): Audit<I, never, Q> {
    return new Audit(input, oracle, List.empty());
  }

  private readonly input: I;
  private readonly oracle: Oracle<Q>;
  private readonly rules: List<Rule<I, T, Q, B>>;

  private constructor(
    input: I,
    oracle: Oracle<Q>,
    rules: List<Rule<I, T, Q, B>>
  ) {
    this.input = input;
    this.oracle = oracle;
    this.rules = rules;
  }

  public add<U, C>(rule: Rule<I, U, Q, C>): Audit<I, T | U, Q, B | C> {
    return new Audit(
      this.input,
      this.oracle,
      List.from<Rule<I, T | U, Q, B | C>>(this.rules).push(rule)
    );
  }

  public evaluate(): Branched<Iterable<Outcome<I, T, Q, B>>, B> {
    const outcomes = Cache.empty();

    return Iterable.reduce(
      this.rules,
      (results, rule) =>
        results.flatMap(results =>
          rule
            .evaluate(this.input, this.oracle, outcomes)
            .map(evaluations => results.concat(evaluations))
        ),
      Branched.of<List<Outcome<I, T, Q, B>>, B>(List.empty())
    );
  }
}
