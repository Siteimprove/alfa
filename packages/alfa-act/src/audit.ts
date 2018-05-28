import {
  Target,
  Aspect,
  Aspects,
  Rule,
  Result,
  Question,
  Answer
} from "./types";

const { keys } = Object;
const { isArray } = Array;

export function audit<A extends Aspect, T extends Target>(
  aspects: Pick<Aspects, A>,
  rules: Rule<A, T> | Array<Rule<A, T>>,
  answers: Array<Answer> = []
): Array<Result<A, T> | Question<T>> {
  const results: Array<Result<A, T> | Question<T>> = [];

  function question(rule: Rule<A, T>, question: string, target?: T): boolean {
    const answer = answers.find(
      answer =>
        answer.rule === rule.id &&
        answer.question === question &&
        answer.target === target
    );

    if (answer) {
      return answer.answer;
    } else {
      results.push({
        rule: rule.id,
        question,
        target
      });

      return false;
    }
  }

  for (const rule of isArray(rules) ? rules : [rules]) {
    const context = rule.context(aspects);

    const applicability = rule.applicability(aspects, context);

    const targets =
      applicability === null
        ? []
        : isArray(applicability)
          ? applicability
          : [applicability];

    if (targets.length === 0) {
      results.push({
        rule: rule.id,
        outcome: "inapplicable",
        aspects
      });
    } else {
      for (const target of targets) {
        let passed = true;

        for (const key of keys(rule.expectations)) {
          const expectation = rule.expectations[key];
          const holds = expectation(
            target,
            aspects,
            (id, target) => question(rule, id, target),
            context
          );

          if (!holds) {
            passed = false;
          }
        }

        results.push({
          rule: rule.id,
          outcome: passed ? "passed" : "failed",
          aspects,
          target
        });
      }
    }
  }

  return results;
}
