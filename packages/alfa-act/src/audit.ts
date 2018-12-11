import { groupBy, Mutable, values } from "@siteimprove/alfa-util";
import { isAtomic, isResult } from "./guards";
import { sortRules } from "./sort-rules";
import {
  Answer,
  Aspect,
  AspectsFor,
  Atomic,
  Composite,
  Data,
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

const { isArray } = Array;

export type AspectsOf<R extends Rule<any, any>> = R extends Rule<
  infer A,
  infer T
>
  ? A
  : never;

export type TargetsOf<R extends Rule<any, any>> = R extends Rule<
  infer A,
  infer T
>
  ? T
  : never;

export function audit<
  R extends Rule<any, any>,
  A extends AspectsOf<R> = AspectsOf<R>,
  T extends TargetsOf<R> = TargetsOf<R>
>(
  aspects: AspectsFor<A>,
  rules: ReadonlyArray<R> | { readonly [P in R["id"]]: R },
  answers: ReadonlyArray<Answer<T>> = []
): ReadonlyArray<Result<A, T> | Question<A, T>> {
  rules = isArray(rules) ? rules : values(rules);

  const results: Array<Result<A, T> | Question<A, T>> = [];

  function question(
    rule: Atomic.Rule<A, T>,
    expectation: number,
    aspect: A,
    target: T
  ): boolean | null {
    const answer = answers.find(
      answer =>
        answer.rule.id === rule.id &&
        answer.expectation === expectation &&
        answer.aspect === aspect &&
        answer.target === target
    );

    if (answer !== undefined) {
      return answer.answer;
    }

    results.push({ rule, expectation, aspect, target });

    return null;
  }

  for (const rule of sortRules(rules)) {
    if (isAtomic(rule)) {
      auditAtomic<A, T>(aspects, rule, results, (expectation, aspect, target) =>
        question(rule, expectation, aspect, target)
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
  question: (expectation: number, aspect: A, target: T) => boolean | null
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
        rule,
        outcome: Outcome.Inapplicable
      });
    }
  };

  const expectations: Atomic.Expectations<A, T> = expectations => {
    for (const [aspect, target] of targets) {
      const result: Result<A, T, Outcome.Passed | Outcome.Failed> = {
        rule,
        outcome: Outcome.Passed,
        aspect,
        target,
        expectations: {}
      };

      expectations(aspect, target, getExpectationEvaluater(rule, result), id =>
        question(id, aspect, target)
      );

      results.push(result);
    }
  };

  rule.definition(applicability, expectations, aspects);
}

function auditComposite<A extends Aspect, T extends Target>(
  aspects: AspectsFor<A>,
  rule: Composite.Rule<A, T>,
  results: Array<Result<A, T> | Question<A, T>>
): void {
  const composes = new WeakMap<Rule<A, T>, Rule<A, T>>();

  for (const composite of rule.composes) {
    composes.set(composite, composite);
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

        const result: Result<A, T, Outcome.Passed | Outcome.Failed> = {
          rule,
          outcome: Outcome.Passed,
          aspect,
          target,
          expectations: {}
        };

        expectations(results, getExpectationEvaluater(rule, result));

        results.push(result);
      }
    }
  };

  rule.definition(expectations);
}

function getExpectationEvaluater<A extends Aspect, T extends Target>(
  rule: Rule<any, any>,
  result: Mutable<
    Result<any, any, Outcome.Passed | Outcome.Failed | Outcome.CantTell>
  >
): (id: number, holds: boolean | null, data?: Data | null) => void {
  const { locales = [] } = rule;

  const locale = locales.find(locale => locale.id === "en");

  return (id, holds, data = null) => {
    result.outcome =
      holds === null
        ? Outcome.CantTell
        : holds
        ? Outcome.Passed
        : Outcome.Failed;

    let message: string | null = null;

    if (locale !== undefined) {
      const messages = locale.expectations[id];

      if (messages !== undefined) {
        const callback = messages[result.outcome];

        if (callback !== undefined) {
          message = callback(data === null ? {} : data);
        }
      }
    }

    if (message === null) {
      const status =
        holds === null
          ? "was not evaluated"
          : holds
          ? "holds"
          : "does not hold";

      message = `Expectation ${id} ${status}`;
    }

    result.expectations[id] = { holds, message, data };
  };
}
