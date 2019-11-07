import { None, Option } from "@siteimprove/alfa-option";

import { Oracle } from "./oracle";
import { Question } from "./question";
import { Rule } from "./rule";

export type Interview<Q, S, T> =
  | T
  | { [K in keyof Q]: Question<K, Q[K], S, Interview<Q, S, T>> }[keyof Q];

export namespace Interview {
  export function conduct<I, T, Q, A, B>(
    interview: Interview<Q, T, A>,
    rule: Rule<I, T, Q, B>,
    oracle: Oracle<Q>,
    branches: Iterable<B>
  ): Option<A> {
    while (interview instanceof Question) {
      const answer = oracle(rule, interview, branches);

      if (answer.isSome()) {
        interview = answer.get();
      } else {
        return None;
      }
    }

    return Option.of(interview);
  }
}
