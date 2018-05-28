import { Test } from "@siteimprove/alfa-test";
import {
  Outcome,
  Result,
  Target,
  Aspect,
  Question,
  isResult
} from "@siteimprove/alfa-act";
import { serialize } from "@siteimprove/alfa-dom";

export function outcome<A extends Aspect, T extends Target>(
  t: Test,
  results: Array<Result<A, T> | Question<T>>,
  assert: { [O in Outcome]?: Array<T> }
) {
  const outcomes: Array<Outcome> = ["passed", "failed", "inapplicable"];

  for (const outcome of outcomes) {
    const actual = results
      .filter(isResult)
      .filter(result => result.outcome === outcome);
    const expected = assert[outcome] || [];

    t.is(
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

        t.true(holds, `${serialize(target)} must be ${outcome}, was `);
      }
    }
  }
}
