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
  export function of<S, U extends URI = URI>(
    uri: U,
    message: string,
    subject: S
  ): act.Question<
    DATA[U]["type"],
    S,
    S,
    Question[DATA[U]["type"]],
    Question[DATA[U]["type"]],
    U
  >;

  export function of<S, C, U extends URI = URI>(
    uri: U,
    message: string,
    subject: S,
    context: C
  ): act.Question<
    DATA[U]["type"],
    S,
    C,
    Question[DATA[U]["type"]],
    Question[DATA[U]["type"]],
    U
  >;

  export function of<S, U extends URI = URI>(
    uri: U,
    message: string,
    subject: S,
    context: S = subject
  ): act.Question<
    DATA[U]["type"],
    S,
    S,
    Question[DATA[U]["type"]],
    Question[DATA[U]["type"]],
    U
  > {
    return act.Question.of(
      QuestionData[uri].type,
      uri,
      message,
      subject,
      context
    );
  }

  type QuestionInfo = {
    readonly type: keyof Question;
    readonly message: string;
  };

  // If a question data is poorly filled, the intersection reduces to never
  // and `of` doesn't type correctly.
  type DATA = typeof QuestionData & Record<URI, QuestionInfo>;

  type URI = "first-tabbable-reference-is-main";

  const QuestionData = {
    "first-tabbable-reference-is-main": {
      type: "boolean",
      message: `Does the first tabbable element of the document point to the main content?`,
    },
  } as const;
}
