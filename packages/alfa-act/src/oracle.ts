import { Future } from "@siteimprove/alfa-future";
import { Option } from "@siteimprove/alfa-option";

import { Question } from "./question";
import { Rule } from "./rule";

/**
 * @public
 * * I: type of Input for rules
 * * T: possible types of test targets
 * * Q: questions' metadata type; has the shape {URI: [T, type]} where
 *      URI is the question URI, T a representation of the expected return
 *      type, and type the actual return type.
 *      e.g. { "q1": ["boolean", boolean]}
 * * S: possible types of questions' subject.
 */
export type Oracle<I, T, Q, S> = <A>(
  rule: Rule<I, T, Q, S>,
  question: { [K in keyof Q]: Question<K, S, T, Q[K], A> }[keyof Q]
) => Future<Option<A>>;
