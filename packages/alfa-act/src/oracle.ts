import { Option } from "@siteimprove/alfa-option";

import { Question } from "./question";
import { Rule } from "./rule";

export type Oracle<Q> = <I, T, A, B>(
  rule: Rule<I, T, Q, B>,
  question: {
    [K in keyof Q]: Question<K, Q[K], Rule.Target<Rule.Aspect<I>, T>, A>;
  }[keyof Q],
  branches: Option<Iterable<B>>
) => Option<A>;
