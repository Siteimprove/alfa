import {
  Aspect,
  Aspects,
  audit,
  isResult,
  Outcome,
  Rule,
  Target
} from "@siteimprove/alfa-act";
import { Assertions } from "@siteimprove/alfa-test";

export function outcome<T extends Target, A extends Aspect, B extends Aspects>(
  t: Assertions,
  rule: Rule<A>,
  aspects: Aspects,
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

  const results = audit(aspects, [rule]).filter(
    result => result.rule === rule.id
  );

  if (assert === Outcome.Inapplicable) {
    t(results[0], Outcome.Inapplicable);
    return;
  }

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
