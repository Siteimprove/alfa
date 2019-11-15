import { Future } from "@siteimprove/alfa-future";
import { None, Option } from "@siteimprove/alfa-option";

import { Oracle } from "./oracle";
import { Question } from "./question";
import { Rule } from "./rule";

export type Interview<Q, S, T> =
  | T
  | { [K in keyof Q]: Question<K, Q[K], S, Interview<Q, S, T>> }[keyof Q];

export namespace Interview {
  export function conduct<I, T, Q, A>(
    interview: Interview<Q, T, A>,
    rule: Rule<I, T, Q>,
    oracle: Oracle<Q>
  ): Future<Option<A>> {
    if (interview instanceof Question) {
      return oracle(rule, interview).flatMap(answer =>
        answer
          .map(answer => conduct(answer, rule, oracle))
          .getOrElse(() => Future.settle(None))
      );
    }

    return Future.settle(Option.of(interview));
  }
}
