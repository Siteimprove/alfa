import * as act from "@siteimprove/alfa-act";
import { Node } from "@siteimprove/alfa-dom";

export interface Question {
  boolean: boolean;
  node: Node;
  "node[]": Iterable<Node>;
}

export namespace Question {
  export function of<Q extends keyof Question, T>(
    uri: string,
    type: Q,
    subject: T,
    message: string
  ): act.Question<Q, Question[Q], T> {
    return act.Question.of(uri, type, subject, message);
  }
}
