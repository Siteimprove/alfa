import { Future } from "@siteimprove/alfa-future";
import { Option } from "@siteimprove/alfa-option";

import { Question } from "./question";
import { Rule } from "./rule";

export type Oracle<Q> = <I, S, T>(
  rule: Rule<I, S, Q>,
  question: { [K in keyof Q]: Question<K, Q[K], S, T> }[keyof Q]
) => Future<Option<T>>;
