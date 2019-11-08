import { Option } from "@siteimprove/alfa-option";

import { Question } from "./question";
import { Rule } from "./rule";

export type Oracle<Q> = <I, T, A>(
  rule: Rule<I, T, Q>,
  question: { [K in keyof Q]: Question<K, Q[K], T, A> }[keyof Q]
) => Option<A>;
