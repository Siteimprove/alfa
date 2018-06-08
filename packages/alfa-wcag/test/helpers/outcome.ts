import { Assertions } from "@siteimprove/alfa-test";
import {
  Outcome,
  Result,
  Target,
  Question,
  isResult
} from "@siteimprove/alfa-act";
import { serialize } from "@siteimprove/alfa-dom";

export function outcome<T extends Target>(
  t: Assertions,
  results: Array<Result<T> | Question<T>>,
  assert: { [O in Outcome]?: Array<T> }
) {
  const outcomes: Array<Outcome> = ["passed", "failed", "inapplicable"];

  for (const outcome of outcomes) {
    const actual = results
      .filter(isResult)
      .filter(result => result.outcome === outcome);
    const expected = assert[outcome] || [];

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

        t(holds, `${serialize(target)} must be ${outcome}, was `);
      }
    }
  }
}
