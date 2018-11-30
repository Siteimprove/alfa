import { groupBy } from "@siteimprove/alfa-util";
import { isAtomic, isResult } from "./guards";
import { sortRules } from "./sort-rules";
import {
  Answer,
  Aspect,
  AspectsFor,
  Atomic,
  Composite,
  Outcome,
  Question,
  Result,
  Rule,
  Target
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
  rules: ReadonlyArray<R>,
  answers: ReadonlyArray<Answer<T>> = []
): ReadonlyArray<Result<A, T> | Question<A, T>> {
  const results: Array<Result<A, T> | Question<A, T>> = [];

  function question(
    rule: Atomic.Rule<A, T>,
    id: string,
    aspect: A,
    target: T
  ): boolean {
    const answer = answers.find(
      answer =>
        answer.rule === rule.id &&
        answer.question === id &&
        answer.aspect === aspect &&
        answer.target === target
    );

    if (answer !== undefined) {
      return answer.answer;
    }

    results.push({ rule: rule.id, question: id, aspect, target });

    return false;
  }

  for (const rule of sortRules(rules)) {
    if (isAtomic(rule)) {
      auditAtomic<A, T>(aspects, rule, results, (id, aspect, target) =>
        question(rule, id, aspect, target)
      );
    } else {
      auditComposite<A, T>(aspects, rule, results);
    }
  }

  return results;
}

function auditAtomic<A extends Aspect, T extends Target>(
  aspects: AspectsFor<A>,
  rule: Atomic.Rule<A, T>,
  results: Array<Result<A, T> | Question<A, T>>,
  question: (question: string, aspect: A, target: T) => boolean
): void {
  const targets: Array<[A, T]> | null = [];

  const applicability: Atomic.Applicability<A, T> = (aspect, applicability) => {
    const found = applicability();

    if (found !== null) {
      for (const target of found) {
        targets.push([aspect, target]);
      }
    }

    if (targets.length === 0) {
      results.push({
        rule: rule.id,
        outcome: Outcome.Inapplicable
      });
    }
  };

  const expectations: Atomic.Expectations<A, T> = expectations => {
    for (const [aspect, target] of targets) {
      let holds = true;
      try {
        expectations(
          aspect,
          target,
          (id, holds) => {
            if (!holds) {
              throw new ExpectationError(id);
            }
          },
          id => question(id, aspect, target)
        );
      } catch (err) {
        holds = false;
      }

      if (holds) {
        results.push({
          rule: rule.id,
          outcome: Outcome.Passed,
          aspect,
          target
        });
      } else {
        results.push({
          rule: rule.id,
          outcome: Outcome.Failed,
          aspect,
          target
        });
      }
    }
  };

  rule.definition(applicability, expectations, aspects);
}

function auditComposite<A extends Aspect, T extends Target>(
  aspects: AspectsFor<A>,
  rule: Composite.Rule<A, T>,
  results: Array<Result<A, T> | Question<A, T>>
): void {
  const composes = new Map<Rule["id"], Rule<A, T>>();

  for (const composite of rule.composes) {
    composes.set(composite.id, composite);
  }

  const applicability: Array<Result<A, T>> = [];

  for (const result of results) {
    if (isResult(result) && composes.has(result.rule)) {
      applicability.push(result);
    }
  }

  const targets = groupBy(applicability, result =>
    result.outcome === Outcome.Inapplicable ? null : result.target
  );

  const expectations: Composite.Expectations<A, T> = expectations => {
    for (const [target, results] of targets) {
      if (target === null) {
        continue;
      }

      const aspects = groupBy(results, result =>
        result.outcome === Outcome.Inapplicable ? null : result.aspect
      );

      for (const [aspect, results] of aspects) {
        if (aspect === null) {
          continue;
        }

        let holds = true;
        try {
          expectations(results, (id, holds) => {
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
            aspect,
            target
          });
        } else {
          results.push({
            rule: rule.id,
            outcome: Outcome.Failed,
            aspect,
            target
          });
        }
      }
    }
  };

  rule.definition(expectations);
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
