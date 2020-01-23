import { Oracle } from "@siteimprove/alfa-act";
import { Node } from "@siteimprove/alfa-dom";
import { Future } from "@siteimprove/alfa-future";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Question } from "../../src/";
import isBoolean = Predicate.isBoolean;
import isOption = Option.isOption;
import isIterable = Iterable.isIterable;

// simple helper to build oracles
// only work for the specialised Question type in @siteimprove/alfa-rules
export function makeOracle(answers: {
  [_: string]: boolean | Option<Node> | Iterable<Node>;
}): Oracle<Question> {
  return (rule, question) => {
    const answer = answers[question.uri];
    if (question.type === "boolean" && isBoolean(answer))
      return Future.now(Option.of(question.answer(answer)));
    if (question.type === "node" && isOption(answer))
      return Future.now(Option.of(question.answer(answer)));
    if (question.type === "node[]" && isIterable(answer))
      return Future.now(Option.of(question.answer(answer)));

    return Future.now(None);
  };
}
