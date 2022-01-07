import { Future } from "@siteimprove/alfa-future";
import { Option } from "@siteimprove/alfa-option";

import { Question } from "./question";
import { Rule } from "./rule";

/**
 * The type of question's metadata.
 * * URI: unique identifier
 * * TYPE: a Javascript manipulable representation of the expected answer type
 * * ANSWER: the expected answer type
 *
 * Example:
 *   {
 *     "q1": ["boolean", boolean],
 *     "q2": ["number?", number | undefined],
 *   }
 */
type Metadata<URI extends string, TYPE, ANSWER> = Record<URI, [TYPE, ANSWER]>;

/**
 * @public
 * * INPUT: type of Input for rules
 * * TARGET: possible types of test targets
 * * QUESTION: questions' metadata type; has the shape {URI: [T, A]} where
 *             URI is the question URI, T a representation of the expected return
 *             type, and A the actual return type.
 *             Example:
 *             {
 *               "q1": ["boolean", boolean],
 *               "q2": ["number?", number | undefined],
 *             }
 * * SUBJECT: possible types of questions' subject.
 * * ANSWER: transformed type of questions' answer.
 */
export type Oracle<INPUT, TARGET, QUESTION, SUBJECT> = <ANSWER>(
  rule: Rule<INPUT, TARGET, QUESTION, SUBJECT>,
  question: {
    [URI in keyof QUESTION]: Question<
      QUESTION[URI] extends [infer T, any] ? T : never,
      SUBJECT,
      TARGET,
      QUESTION[URI] extends [any, infer A] ? A : never,
      ANSWER,
      URI extends string ? URI : never
    >;
  }[keyof QUESTION]
) => Future<Option<ANSWER>>;
