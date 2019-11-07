import { Option } from "@siteimprove/alfa-option";

import { Question } from "./question";
import { Rule } from "./rule";

export type Oracle<Q> = <I, T, A, B>(
  rule: Rule<I, T, Q, B>,
  question: { [K in keyof Q]: Question<K, Q[K], T, A> }[keyof Q],
  branches: Iterable<B>
) => Option<A>;
