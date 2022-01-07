import * as act from "@siteimprove/alfa-act";
import { RGB } from "@siteimprove/alfa-css";
import { Node } from "@siteimprove/alfa-dom";
import { Future } from "@siteimprove/alfa-future";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { Refinement } from "@siteimprove/alfa-refinement";

import { Question } from "../../src/common/question";

const { isIterable } = Iterable;
const { isOption } = Option;
const { isBoolean, isString } = Refinement;

function wrapper<A, T>(
  question: act.Question<unknown, unknown, unknown, A, T, string>,
  answer: A
): Future<Option<T>> {
  return Future.now(Option.of(question.answer(answer)));
}

const dontKnow = Future.now(None);

type Uri = keyof Question.Metadata;

export function oracle<I, T, S>(answers: {
  [uri: string]: Question.Type[keyof Question.Type];
}): act.Oracle<I, T, Question.Type, S> {
  return (rule, question) => {
    const answer = answers[question.uri];

    // * We use a switch with no default case to ensure exhaustive matching at
    //   the type level.
    // * We need to check the type of `answer` because there is no link between
    //   URI and type, so `answers` cannot be better typed that with the union
    //   of all possible types.
    // * We can't pre-compute `wrapper` because narrowing the type of `answer`
    //   won't narrow the type of the wrapped answer.
    // * We could have a better wrapper, taking the refinement as an argument,
    //   and doing all the work. However, `isOption<Node>` is not callable as
    //   is; `isOption` is not narrowing enough; and eta-expanding it breaks
    //   the narrowing. So we'd need a new refinement to only be an
    //   eta-expanded `isOption<Node>`, which is a bit overkill.
    switch (question.type) {
      case "boolean":
        return isBoolean(answer) ? wrapper(question, answer) : dontKnow;

      case "node":
        return isOption<Node>(answer) ? wrapper(question, answer) : dontKnow;

      case "node[]":
        return isIterable<Node>(answer) ? wrapper(question, answer) : dontKnow;

      case "color":
        return isOption<RGB>(answer) ? wrapper(question, answer) : dontKnow;

      case "color[]":
        return isIterable<RGB>(answer) ? wrapper(question, answer) : dontKnow;

      case "string":
        return isString(answer) ? wrapper(question, answer) : dontKnow;
    }
  };
}
