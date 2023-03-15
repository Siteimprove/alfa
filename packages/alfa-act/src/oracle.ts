import type { Future } from "@siteimprove/alfa-future";
import type { Hashable } from "@siteimprove/alfa-hash";
import type { Option } from "@siteimprove/alfa-option";

import type { Question } from "./question";
import type { Rule } from "./rule";

/**
 * @public
 * * QUESTION: questions' metadata type; has the shape \{ URI: [T, A] \} where
 *             URI is the question URI, T a representation of the expected return
 *             type, and A the actual return type.
 *             Example:
 *             \{
 *               "q1": ["boolean", boolean],
 *               "q2": ["number?", number | undefined],
 *             \}
 */
export type Oracle<
  INPUT,
  TARGET extends Hashable,
  QUESTION extends Question.Metadata,
  SUBJECT
> = (
  rule: Rule<INPUT, TARGET, QUESTION, SUBJECT>,
  question: {
    [URI in keyof QUESTION]: Question<
      QUESTION[URI][0],
      SUBJECT,
      TARGET,
      QUESTION[URI][1],
      unknown,
      URI extends string ? URI : never
    >;
  }[keyof QUESTION]
) => Future<Option<QUESTION[keyof QUESTION][1]>>;
