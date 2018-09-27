import { groupBy } from "@siteimprove/alfa-util";
import { isAtomic, isResult } from "./guards";
import { sortRules } from "./sort-rules";
import {
  Answer,
  Aspect,
  Aspects,
  Atomic,
  Composite,
  Question,
  Result,
  Rule,
  Target
} from "./types";

const { isArray } = Array;

export function audit<A extends Aspect, T extends Target>(
  aspects: Pick<Aspects, A>,
  rules: Rule<A, T> | Array<Rule<A, T>>,
  answers: Array<Answer<A, T>> = []
): Array<Result<A, T> | Question<A, T>> {
  const results: Array<Result<A, T> | Question<A, T>> = [];

  function question(rule: Rule<A, T>, id: string, target?: T): boolean {
    const answer = answers.find(
      answer =>
        answer.rule === rule &&
        answer.question === id &&
        answer.target === target
    );

    if (answer !== undefined) {
      return answer.answer;
    } else {
      results.push({
        rule: rule,
        question: id,
        target
      });

      return false;
    }
  }

  for (const rule of isArray(rules) ? sortRules(rules) : [rules]) {
    if (isAtomic(rule)) {
      auditAtomic(aspects, rule, results, (id, target) =>
        question(rule, id, target)
      );
    } else {
      auditComposite(aspects, rule, results);
    }
  }

  return results;
}

function auditAtomic<A extends Aspect, T extends Target>(
  aspects: Pick<Aspects, A>,
  rule: Atomic.Rule<A, T>,
  results: Array<Result<A, T> | Question<A, T>>,
  question: (question: string, target?: T) => boolean
): void {
  const targets: Array<T> | null = [];

  rule.definition(
    applicability => {
      const target = applicability();

      if (target !== null) {
        if (isArray(target)) {
          targets.push(...target);
        } else {
          targets.push(target);
        }
      }

      if (targets.length === 0) {
        results.push({
          rule,
          outcome: "inapplicable"
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

        results.push({
          rule,
          outcome: holds ? "passed" : "failed",
          target
        });
      }
    },
    aspects
  );
}

function auditComposite<A extends Aspect, T extends Target>(
  aspects: Pick<Aspects, A>,
  rule: Composite.Rule<A, T>,
  results: Array<Result<A, T> | Question<A, T>>
): void {
  const composes = new Set(rule.composes);

  const applicability: Array<Result<A, T>> = [];

  for (const result of results) {
    if (
      isResult(result) &&
      isAtomic(result.rule) &&
      composes.has(result.rule)
    ) {
      applicability.push(result);
    }
  }

  const targets = groupBy(
    applicability,
    result => (result.outcome === "inapplicable" ? null : result.target)
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

      results.push({
        rule,
        outcome: holds ? "passed" : "failed",
        target
      });
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
