import { Question } from "@siteimprove/alfa-act-base";
import { Future } from "@siteimprove/alfa-future";
import { Option } from "@siteimprove/alfa-option";

import { Rule } from "./rule";

/**
 * @public
 */
export type Oracle<I, T, Q, S> = <A>(
  rule: Rule<I, T, Q, S>,
  question: { [K in keyof Q]: Question<K, S, T, Q[K], A> }[keyof Q]
) => Future<Option<A>>;
