import {
  Aspect,
  isResult,
  Outcome,
  Question,
  Result,
  Target
} from "@siteimprove/alfa-act";
import { serialize } from "@siteimprove/alfa-dom";
import { Assertions } from "@siteimprove/alfa-test";

export function outcome<A extends Aspect, T extends Target>(
  t: Assertions,
  results: Array<Result<A, T> | Question<A, T>>,
  assert: { [O in Outcome]?: Array<T> }
) {
  const outcomes: Array<Outcome> = ["passed", "failed", "inapplicable"];

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
      } else {
        const holds = actual.some(
          result =>
            result.outcome === "inapplicable" || result.target === target
        );

        t(holds, `${serialize(target, target)} must be ${outcome}, was `);
      }
    }
  }
}
