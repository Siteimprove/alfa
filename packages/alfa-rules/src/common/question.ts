import { RGB } from "@siteimprove/alfa-css";
import { Node } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";

import * as act from "@siteimprove/alfa-act";

/**
 * @public
 */
export interface Question {
  boolean: boolean;
  node: Option<Node>;
  "node[]": Iterable<Node>;
  color: Option<RGB>;
  "color[]": Iterable<RGB>;
}

/**
 * @public
 */
export namespace Question {
  export function of<Q extends keyof Question, S, C>(
    uri: string,
    type: Q,
    subject: S,
    context: C,
    message: string
  ): act.Question<Q, S, C, Question[Q]> {
    return act.Question.of(uri, type, subject, context, message);
  }
}
