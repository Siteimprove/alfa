import {
  Answer,
  Aspect,
  Aspects,
  Question,
  Result,
  Rule,
  Target
} from "./types";

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

    if (answer !== undefined) {
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
              id => question(rule, id, target)
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

  return results;
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
