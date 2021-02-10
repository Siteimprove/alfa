import { Future } from "@siteimprove/alfa-future";
import { None, Option } from "@siteimprove/alfa-option";

import { Oracle } from "./oracle";
import { Question } from "./question";
import { Rule } from "./rule";

/**
 * As `Interview` is a recursive type that models nested chains of `Question`s,
 * we need to limit the depth to which this recursion can happen to avoid the
 * TypeScript compiler going into an infinite type resolution loop. This is done
 * by maintaining a pointer, `D extends number` that down to -1 at which point
 * the recursion will stop. Given a pointer `D`, the `Depths` tuple provides
 * `D - 1 = Depths[D]`.
 */
type Depths = [-1, 0, 1, 2];

export type Interview<Q, S, T, D extends number = 3> =
  | T
  | {
      [K in keyof Q]: Question<
        K,
        Q[K],
        S,
        D extends -1 ? T : Interview<Q, S, T, Depths[D]>
      >;
    }[keyof Q];

export namespace Interview {
  export function conduct<I, T, Q, A>(
    interview: Interview<Q, T, A>,
    rule: Rule<I, T, Q>,
    oracle: Oracle<Q>
  ): Future<Option<A>> {
    if (interview instanceof Question) {
      return oracle(rule, interview).flatMap((answer) =>
        answer
          .map((answer) => conduct(answer, rule, oracle))
          .getOrElse(() => Future.now(None))
      );
    }

    return Future.now(Option.of(interview));
  }
}
