import * as act from "@siteimprove/alfa-act";
import { Node } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";

export interface Question {
  boolean: boolean;
  node: Option<Node>;
  "node[]": Iterable<Node>;
}

export namespace Question {
  export function of<Q extends keyof Question, S>(
    uri: string,
    type: Q,
    subject: S,
    message: string
  ): act.Question<Q, Question[Q], S> {
    return act.Question.of(uri, type, subject, message);
  }
}
