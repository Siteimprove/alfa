import {
  Aspect,
  isResult,
  Outcome,
  Question,
  Result,
  Rule,
  Target
} from "@siteimprove/alfa-act";
import { Assertions } from "@siteimprove/alfa-test";

export function outcome<T extends Target, A extends Aspect>(
  t: Assertions,
  rule: Rule<A>,
  results: Array<Result<T> | Question<T>>,
  assert:
    | Outcome.Inapplicable
    | Readonly<
        { [O in Outcome.Failed | Outcome.Passed | Outcome.CantTell]?: Array<T> }
      >
) {
  const outcomes: Array<Outcome.Passed | Outcome.Failed | Outcome.CantTell> = [
    Outcome.Passed,
    Outcome.Failed,
    Outcome.CantTell
  ];

  const ruleResults = results.filter(result => result.rule === rule.id);

  if (assert === Outcome.Inapplicable) {
    t(ruleResults[0], Outcome.Inapplicable);
    return;
  }

  for (const outcome of outcomes) {
    const actual = ruleResults
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
