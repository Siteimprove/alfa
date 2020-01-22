import { Oracle } from "@siteimprove/alfa-act";
import { Node } from "@siteimprove/alfa-dom";
import { Future } from "@siteimprove/alfa-future";
import { None, Option } from "@siteimprove/alfa-option";
import { Question } from "../../src/";

export function makeOracle(
  boolAnswers: { [_: string]: boolean },
  nodeAnswers: { [_: string]: Option<Node> },
  nodeListAnswers: { [_: string]: Iterable<Node> }
): Oracle<Question> {
  return (rule, question) => {
    switch (question.type) {
      case "boolean":
        return question.uri in boolAnswers
          ? Future.now(Option.of(question.answer(boolAnswers[question.uri])))
          : Future.now(None);
      case "node":
        return question.uri in nodeAnswers
          ? Future.now(Option.of(question.answer(nodeAnswers[question.uri])))
          : Future.now(None);
      case "node[]":
        return question.uri in nodeListAnswers
          ? Future.now(
              Option.of(question.answer(nodeListAnswers[question.uri]))
            )
          : Future.now(None);
    }
    return Future.now(None);
  };
}
