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

export async function check<T extends Target, A extends Aspect>(
  rule: Rule<T, A>,
  aspects: Pick<Aspects, A>,
  answers: Array<Answer<T>> = []
): Promise<Array<Result<T, A> | Question<T>>> {
  const results: Array<Result<T, A> | Question<T>> = [];

  const targets = [...(await rule.applicability(aspects))];

  function question(question: string, target?: T): boolean {
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
        const holds = await expectation(target, aspects, question);

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

  return results;
}

export async function checkAll<T extends Target, A extends Aspect>(
  rules: Array<Rule<T, A>>,
  aspects: Pick<Aspects, A>,
  answers: Array<Answer<T>> = []
): Promise<Array<Result<T, A> | Question<T>>> {
  const results: Array<Result<T, A> | Question<T>> = [];

  for (const rule of rules) {
    for (const result of await check(rule, aspects)) {
      results.push(result);
    }
  }

  return results;
}
