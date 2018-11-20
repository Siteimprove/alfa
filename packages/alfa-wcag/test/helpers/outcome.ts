import {
  Aspect,
  AspectsFor,
  audit,
  isResult,
  Outcome,
  Rule,
  Target
} from "@siteimprove/alfa-act";
import { Assertions } from "@siteimprove/alfa-test";
import { concat } from "@siteimprove/alfa-util";

export function outcome<A extends Aspect, T extends Target>(
  t: Assertions,
  rule: Rule<A, T>,
  aspects: AspectsFor<A>,
  assert:
    | Outcome.Inapplicable
    | Readonly<
        { [O in Outcome.Failed | Outcome.Passed | Outcome.CantTell]?: Array<T> }
      >,
  dependencies: Array<Rule<A, T>> = []
) {
  const outcomes: Array<Outcome.Passed | Outcome.Failed | Outcome.CantTell> = [
    Outcome.Passed,
    Outcome.Failed,
    Outcome.CantTell
  ];

  const results = audit(aspects, concat([rule], dependencies)).filter(
    result => result.rule === rule.id
  );

  if (assert === Outcome.Inapplicable) {
    t.equal(results.length, 1, "There must only be one result");
    const result = results[0];
    t(
      isResult(result) && result.outcome === Outcome.Inapplicable,
      "The outcome must be inapplicable"
    );
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
