import { Oracle } from "@siteimprove/alfa-act";
import { RGB } from "@siteimprove/alfa-css";
import { Node } from "@siteimprove/alfa-dom";
import { Future } from "@siteimprove/alfa-future";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Question } from "../../src/common/question";

export function oracle(answers: {
  [uri: string]:
    | boolean
    | Option<Node>
    | Iterable<Node>
    | Option<RGB>
    | Iterable<RGB>;
}): Oracle<Question> {
  return (rule, question) => {
    const answer = answers[question.uri];

    if (question.type === "boolean" && Predicate.isBoolean(answer)) {
      return Future.now(Option.of(question.answer(answer)));
    }

    if (question.type === "node" && Option.isOption<Node>(answer)) {
      return Future.now(Option.of(question.answer(answer)));
    }

    if (question.type === "node[]" && Iterable.isIterable<Node>(answer)) {
      return Future.now(Option.of(question.answer(answer)));
    }

    if (question.type === "color" && Option.isOption<RGB>(answer)) {
      return Future.now(Option.of(question.answer(answer)));
    }

    if (question.type === "color[]" && Iterable.isIterable<RGB>(answer)) {
      return Future.now(Option.of(question.answer(answer)));
    }

    return Future.now(None);
  };
}
