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
    if (
      answer.type !== question.type ||
      answer.id !== question.id ||
      answer.aspect !== question.aspect ||
      answer.target !== question.target
    ) {
      continue;
    }

    if (answer.rule === undefined) {
      if (question.scope === QuestionScope.Global) {
        return answer as Answer<A, T, Q>;
      }
    } else {
      const haystack = isIterable(answer.rule)
        ? [...answer.rule]
        : [answer.rule];

      const needle = isIterable(question.rule)
        ? [...question.rule]
        : [question.rule];

      if (
        haystack.some(haystack =>
          needle.some(needle => haystack.id === needle.id)
        )
      ) {
        return answer as Answer<A, T, Q>;
      }
    }
  }

  return null;
}
