import { Future } from "@siteimprove/alfa-future";
import { Option } from "@siteimprove/alfa-option";

import { Question } from "./question";
import { Rule } from "./rule";

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
export type Oracle<INPUT, TARGET, QUESTION, SUBJECT> = (
  rule: Rule<INPUT, TARGET, QUESTION, SUBJECT>,
  question: {
    [URI in keyof QUESTION]: Question<
      QUESTION[URI] extends [infer T, any] ? T : never,
      SUBJECT,
      TARGET,
      QUESTION[URI] extends [any, infer A] ? A : never,
      unknown,
      URI extends string ? URI : never
    >;
  }[keyof QUESTION]
) => Future<
  Option<QUESTION[keyof QUESTION] extends [any, infer A] ? A : never>
>;
