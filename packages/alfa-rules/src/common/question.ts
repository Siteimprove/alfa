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
  string: string;
}

/**
 * @public
 */
export namespace Question {
  export function of<Q extends keyof Question, S>(
    type: Q,
    uri: string,
    message: string,
    subject: S
  ): act.Question<Q, S, S, Question[Q]>;

  export function of<Q extends keyof Question, S, C>(
    type: Q,
    uri: string,
    message: string,
    subject: S,
    context: C
  ): act.Question<Q, S, C, Question[Q]>;

  export function of<Q extends keyof Question, S>(
    type: Q,
    uri: string,
    message: string,
    subject: S,
    context: S = subject
  ): act.Question<Q, S, S, Question[Q]> {
    return act.Question.of(type, uri, message, subject, context);
  }
}
