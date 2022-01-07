import { Future } from "@siteimprove/alfa-future";
import { None, Option } from "@siteimprove/alfa-option";

import { Oracle } from "./oracle";
import { Question } from "./question";
import { Rule } from "./rule";

/**
 * As `Interview` is a recursive type that models nested chains of `Question`s,
 * we need to limit the depth to which this recursion can happen to avoid the
 * TypeScript compiler going into an infinite type resolution loop. This is done
 * by maintaining a pointer, `D extends number` that counts down to -1 at which
 * point the recursion will stop. Given a pointer `D`, the `Depths` tuple
 * provides `D - 1 = Depths[D]`.
 */
type Depths = [-1, 0, 1, 2];

/**
 * @public
 */
export type Interview<
  QUESTION,
  SUBJECT,
  CONTEXT,
  ANSWER,
  D extends number = 3
> =
  | ANSWER
  | {
      [URI in keyof QUESTION]: Question<
        QUESTION[URI] extends [infer T, any] ? T : never,
        SUBJECT,
        CONTEXT,
        QUESTION[URI] extends [any, infer A] ? A : never,
        D extends -1
          ? ANSWER
          : Interview<QUESTION, SUBJECT, CONTEXT, ANSWER, Depths[D]>,
        URI extends string ? URI : never
      >;
    }[keyof QUESTION];

/**
 * @public
 */
export namespace Interview {
  export function conduct<I, T, Q, S, A>(
    interview: Interview<Q, S, T, A>,
    rule: Rule<I, T, Q, S>,
    oracle: Oracle<I, T, Q, S>
  ): Future<Option<A>> {
    if (interview instanceof Question) {
      let answer: Future<Option<Interview<Q, S, T, A>>>;

      if (interview.isRhetorical()) {
        answer = Future.now(Option.of(interview.answer()));
      } else {
        answer = oracle(rule, interview);
      }

      return answer.flatMap((answer) =>
        answer
          .map((answer) => conduct(answer, rule, oracle))
          .getOrElse(() => Future.now(None))
      );
    }

    return Future.now(Option.of(interview));
  }
}
