import {
  Aspect,
  isResult,
  Outcome,
  Question,
  Result,
  Target
} from "@siteimprove/alfa-act";
import { Assertions } from "@siteimprove/alfa-test";

export function outcome<A extends Aspect, T extends Target>(
  t: Assertions,
  results: Array<Result<A, T> | Question<A, T>>,
  assert: { [O in Outcome]?: Array<T> }
) {
  const outcomes: Array<Outcome> = [
    Outcome.Passed,
    Outcome.Failed,
    Outcome.Inapplicable,
    Outcome.CantTell
  ];

  for (const outcome of outcomes) {
    const actual = results
      .filter(isResult)
      .filter(result => result.outcome === outcome);

    const expected = outcome in assert ? assert[outcome]! : [];

    t.equal(
      actual.length,
      expected.length,
      `There must be ${expected.length} ${outcome} results`
    );

    for (const target of expected) {
      if (target === null) {
        // Black magic will happen here
      } else {
        const holds = actual.some(
          result =>
            result.outcome === Outcome.Inapplicable || result.target === target
        );

        t(holds);
      }
    }
  }
}
