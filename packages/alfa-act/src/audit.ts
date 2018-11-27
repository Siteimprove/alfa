import { groupBy } from "@siteimprove/alfa-util";
import { isAtomic, isResult } from "./guards";
import { sortRules } from "./sort-rules";
import {
  Answer,
  AspectsFor,
  Atomic,
  Composite,
  Outcome,
  Question,
  Result,
  Rule
} from "./types";

// The `audit()` function is special in that it requires use of conditional
// types in order to correctly infer the union of aspect and target types for a
// list of rules. In order to do so, we unfortunately have to make use of the
// `any` type, which trips up TSLint as we've made the `any` type forbidden and
// this for good reason.
//
// tslint:disable:no-any

type AspectsOf<R extends Rule<any, any>> = R extends Rule<infer A, infer T>
  ? A
  : never;

type TargetsOf<R extends Rule<any, any>> = R extends Rule<infer A, infer T>
  ? T
  : never;

export function audit<
  R extends Rule<any, any>,
  A extends AspectsOf<R> = AspectsOf<R>,
  T extends TargetsOf<R> = TargetsOf<R>
>(
  aspects: AspectsFor<A>,
  rules: Array<R>,
  answers: Array<Answer<T>> = []
): Array<Result<T> | Question<T>> {
  const results: Array<Result<T> | Question<T>> = [];

  function question(rule: R, id: string, target: T): boolean {
    const answer = answers.find(
      answer =>
        answer.rule === rule.id &&
        answer.question === id &&
        answer.target === target
    );

    if (answer !== undefined) {
      return answer.answer;
    } else {
      results.push({
        rule: rule.id,
        question: id,
        target
      });

      return false;
    }
  }

  for (const rule of sortRules(rules)) {
    if (isAtomic(rule)) {
      auditAtomic(aspects, rule, results, (id, target) =>
        question(rule as R, id, target)
      );
    } else {
      auditComposite(aspects, rule, results);
    }
  }

  return results;
}

function auditAtomic<
  R extends Atomic.Rule<any, any>,
  A extends AspectsOf<R> = AspectsOf<R>,
  T extends TargetsOf<R> = TargetsOf<R>
>(
  aspects: AspectsFor<A>,
  rule: R,
  results: Array<Result<T> | Question<T>>,
  question: (question: string, target: T) => boolean
): void {
  const targets: Array<T> | null = [];

  rule.definition(
    applicability => {
      const target = applicability();

      if (target !== null) {
        targets.push(...target);
      }

      if (targets.length === 0) {
        results.push({
          rule: rule.id,
          outcome: Outcome.Inapplicable
        });
      }
    },
    expectations => {
      for (const target of targets) {
        let holds = true;
        try {
          expectations(
            target,
            (id, holds) => {
              if (!holds) {
                throw new ExpectationError(id);
              }
            },
            id => question(id, target)
          );
        } catch (err) {
          holds = false;
        }

        if (holds) {
          results.push({
            rule: rule.id,
            outcome: Outcome.Passed,
            target
          });
        } else {
          results.push({
            rule: rule.id,
            outcome: Outcome.Failed,
            target
          });
        }
      }
    },
    aspects as any
  );
}

function auditComposite<
  R extends Composite.Rule<any, any>,
  A extends AspectsOf<R> = AspectsOf<R>,
  T extends TargetsOf<R> = TargetsOf<R>
>(
  aspects: AspectsFor<A>,
  rule: R,
  results: Array<Result<T> | Question<T>>
): void {
  const composes = new Map<Rule["id"], Rule<A, T>>();

  for (const composite of rule.composes) {
    composes.set(composite.id, composite);
  }

  const applicability: Array<Result<T>> = [];

  for (const result of results) {
    if (isResult(result) && composes.has(result.rule)) {
      applicability.push(result);
    }
  }

  const targets = groupBy(
    applicability,
    result => (result.outcome === Outcome.Inapplicable ? null : result.target)
  );

  rule.definition(expectations => {
    for (const entry of targets) {
      const target = entry[0];

      if (target === null) {
        continue;
      }

      let holds = true;
      try {
        expectations(entry[1], (id, holds) => {
          if (!holds) {
            throw new ExpectationError(id);
          }
        });
      } catch (err) {
        holds = false;
      }

      if (holds) {
        results.push({
          rule: rule.id,
          outcome: Outcome.Passed,
          target
        });
      } else {
        results.push({
          rule: rule.id,
          outcome: Outcome.Failed,
          target
        });
      }
    }
  });
}

class ExpectationError implements Error {
  public readonly name = "ExpectationError";
  public readonly message: string;
  public readonly id: number;

  public constructor(id: number) {
    this.id = id;
    this.message = `Expectation ${id} does not hold`;
  }
}
