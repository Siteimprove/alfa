import {
  Answer,
  AspectsFor,
  AspectsOf,
  audit,
  isResult,
  Outcome,
  Result,
  Rule,
  TargetsOf
} from "@siteimprove/alfa-act";
import { Assertions } from "@siteimprove/alfa-test";

// tslint:disable:no-any

export function outcome<
  R extends Rule<any, any>,
  A extends AspectsOf<R> = AspectsOf<R>,
  T extends TargetsOf<R> = TargetsOf<R>
>(
  t: Assertions,
  rule: Rule<A, T>,
  aspects: AspectsFor<A>,
  assert:
    | Outcome.Inapplicable
    | { readonly [P in Outcome.Passed | Outcome.Failed]?: ReadonlyArray<T> },
  answers: ReadonlyArray<Answer<T>> = []
) {
  const outcomes: Array<Outcome.Passed | Outcome.Failed> = [
    Outcome.Passed,
    Outcome.Failed
  ];

  const results = audit(aspects, [rule], answers).filter(
    result => result.rule === rule
  );

  if (assert === Outcome.Inapplicable) {
    t.equal(results.length, 1, "There must only be one result");

    const [result] = results;

    t(
      isResult(result) && result.outcome === Outcome.Inapplicable,
      "The outcome must be inapplicable"
    );
  } else {
    for (const outcome of outcomes) {
      function hasMatchingOutcome(
        result: Result<any, any>
      ): result is Result<A, T, typeof outcome> {
        return result.outcome === outcome;
      }

      const actual = results.filter(isResult).filter(hasMatchingOutcome);

      const expected = outcome in assert ? assert[outcome]! : [];

      t.equal(
        actual.length,
        expected.length,
        `There must be ${expected.length} ${outcome} results`
      );

      for (const target of expected) {
        t(actual.some(result => result.target === target));
      }
    }
  }
}
