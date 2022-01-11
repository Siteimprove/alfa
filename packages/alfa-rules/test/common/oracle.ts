import * as act from "@siteimprove/alfa-act";
import { Future } from "@siteimprove/alfa-future";
import { None, Option } from "@siteimprove/alfa-option";

import { Question } from "../../src/common/question";

function wrapper<
  TYPE,
  SUBJECT,
  CONTEXT,
  ANSWER,
  T,
  URI extends keyof Question.Metadata
>(
  question: act.Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>,
  answer: ANSWER
): Future<Option<ANSWER>> {
  return Future.now(Option.of(answer));
}

const dontKnow = Future.now(None);

export function oracle<I, T, S>(
  answers: Partial<{
    [URI in keyof Question.Metadata]: Question.Metadata[URI][1];
  }>
): act.Oracle<I, T, Question.Metadata, S> {
  return (rule, question) => {
    // Check if we do have an answer for this question.
    if (answers[question.uri] === undefined) {
      return dontKnow;
    }

    // * We use a switch with no default case to ensure exhaustive matching at
    //   the type level. This also fails type checking if a Question.Type is
    //   not used by any question.
    // * We can't pre-compute `wrapper` or even `answers[question.uri]` because
    //   we first need to narrow by question type to ensure the answer has the
    //   expected type.
    // * Thanks to the initial test, we know that answers[question.uri] exists.
    switch (question.type) {
      case "boolean":
        return wrapper(question, answers[question.uri]!);

      case "node":
        return wrapper(question, answers[question.uri]!);

      case "node[]":
        return wrapper(question, answers[question.uri]!);

      case "color[]":
        return wrapper(question, answers[question.uri]!);

      case "string":
        return wrapper(question, answers[question.uri]!);
    }
  };
}
