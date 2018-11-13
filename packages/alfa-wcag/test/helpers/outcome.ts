import {
  Aspect,
  AspectsFor,
  audit,
  isResult,
  Outcome,
  Result,
  Rule,
  Target
} from "@siteimprove/alfa-act";
import { Assertions } from "@siteimprove/alfa-test";
import { concat } from "@siteimprove/alfa-util";

export function outcome<T extends Target, A extends Aspect>(
  t: Assertions,
  rule: Rule<A>,
  aspects: AspectsFor<A>,
  assert:
    | Outcome.Inapplicable
    | Readonly<
        { [O in Outcome.Failed | Outcome.Passed | Outcome.CantTell]?: Array<T> }
      >,
  compositeRules: Array<Rule<A>> = []
) {
  const outcomes: Array<Outcome.Passed | Outcome.Failed | Outcome.CantTell> = [
    Outcome.Passed,
    Outcome.Failed,
    Outcome.CantTell
  ];

  const results = audit(aspects, concat([rule], compositeRules)).filter(
    result => result.rule === rule.id
  );

  if (assert === Outcome.Inapplicable) {
    t.equal(results.length, 1, "There must only be one result");
    t(
      isResult(results[0]) &&
        (results[0] as Result<T>).outcome === Outcome.Inapplicable,
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
