import {
  Answer,
  Aspect,
  AspectsFor,
  audit,
  Outcome,
  Result,
  Rule,
  Target
} from "@siteimprove/alfa-act";
import { Assertions } from "@siteimprove/alfa-test";

// tslint:disable:no-any

export function outcome<A extends Aspect, T extends Target>(
  t: Assertions,
  rule: Rule<A, T>,
  aspects: AspectsFor<A>,
  assert:
    | Outcome.Inapplicable
    | {
        readonly [P in
          | Outcome.Passed
          | Outcome.Failed
          | Outcome.CantTell]?: ReadonlyArray<T>
      },
  answers: ReadonlyArray<Answer<A, T>> = []
) {
  const outcomes: Array<Outcome.Passed | Outcome.Failed | Outcome.CantTell> = [
    Outcome.Passed,
    Outcome.Failed,
    Outcome.CantTell
  ];

  const results = Array.from(audit(aspects, [rule], answers).results).filter(
    result => result.rule === rule
  );

  if (assert === Outcome.Inapplicable) {
    t.equal(results.length, 1, "There must only be one result");

    const [result] = results;

    t(
      result.outcome === Outcome.Inapplicable,
      "The outcome must be inapplicable"
    );
  } else {
    for (const outcome of outcomes) {
      function hasMatchingOutcome(
        result: Result<any, any>
      ): result is Result<A, T, typeof outcome> {
        return result.outcome === outcome;
      }

      const actual: Array<T> = results
        .filter(hasMatchingOutcome)
        .map(result => {
          return result.target;
        });

      const expected = outcome in assert ? [...assert[outcome]!] : [];

      t.deepEqual(actual, expected);
    }
  }
}
