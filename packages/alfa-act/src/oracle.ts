import { isIterable } from "@siteimprove/alfa-util";
import {
  Answer,
  AnswerType,
  Aspect,
  Question,
  QuestionScope,
  QuestionType,
  Target
} from "./types";

export interface Oracle<A extends Aspect, T extends Target> {
  answer<Q extends QuestionType>(
    question: Question<A, T, Q>
  ): AnswerType[Q] | null;
}

export namespace Oracle {
  /**
   * @internal
   */
  export function forAnswers<A extends Aspect, T extends Target>(
    answers: Iterable<Answer<A, T>>
  ): Oracle<A, T> {
    answers = [...answers];

    return {
      answer(question) {
        const answer = findAnswer(answers, question);

        if (answer === null) {
          return null;
        }

        return answer.answer;
      }
    };
  }
}

function findAnswer<A extends Aspect, T extends Target, Q extends QuestionType>(
  answers: Iterable<Answer<A, T>>,
  question: Question<A, T, Q>
): Answer<A, T, Q> | null {
  for (const answer of answers) {
    if (isAnswerTo(question, answer)) {
      return answer;
    }
  }

  return null;
}

function isAnswerTo<A extends Aspect, T extends Target, Q extends QuestionType>(
  question: Question<A, T, Q>,
  answer: Answer<A, T>
): answer is Answer<A, T, Q> {
  if (
    answer.type !== question.type ||
    answer.id !== question.id ||
    answer.aspect !== question.aspect
  ) {
    return false;
  }

  if (isIterable(answer.target) && isIterable(question.target)) {
    const haystack = new Set(answer.target);
    const needle = new Set(question.target);

    if (haystack.size !== needle.size) {
      return false;
    }

    for (const target of haystack) {
      if (!needle.has(target)) {
        return false;
      }
    }
  } else if (answer.target !== question.target) {
    return false;
  }

  if (answer.rule === undefined) {
    return question.scope === QuestionScope.Global;
  }

  const haystack = new Set(
    isIterable(answer.rule) ? answer.rule : [answer.rule]
  );

  const needle = new Set(
    isIterable(question.rule) ? question.rule : [question.rule]
  );

  for (const rule of haystack) {
    if (!needle.has(rule)) {
      return false;
    }
  }

  return true;
}
