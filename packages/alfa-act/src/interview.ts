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
 *
 * An Interview is either a direct ANSWER, or a question whose ultimately going
 * to produce one, possibly through more questions (aka, an Interview).
 *
 * The QUESTION type maps questions' URI to the expected type of answer, both as
 * a JavaScript manipulable representation (T), and an actual type (A).
 * The SUBJECT and CONTEXT types are the subject and context of the question.
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
 *
 * To conduct an interview:
 * * if it is an answer, just send it back;
 * * if it is a rhetorical question, fetch its answer and recursively conduct
 *   an interview on it;
 * * if it is a true question, ask it to the oracle and recursively conduct an
 *   interview on the result.
 *
 * Oracles must return Options, to have the possibility to not answer a given
 * question (by returning None).
 * Oracles must return Futures, because the full interview process is essentially
 * async (e.g., asking through a CLI).
 */
export namespace Interview {
  export function conduct<INPUT, TARGET, QUESTION, SUBJECT, ANSWER>(
    // Questions' contexts are guaranteed to be (potential) test target of
    // the rule.
    interview: Interview<QUESTION, SUBJECT, TARGET, ANSWER>,
    rule: Rule<INPUT, TARGET, QUESTION, SUBJECT>,
    oracle: Oracle<INPUT, TARGET, QUESTION, SUBJECT>
  ): Future<Option<ANSWER>> {
    if (interview instanceof Question) {
      let answer: Future<Option<Interview<QUESTION, SUBJECT, TARGET, ANSWER>>>;

      if (interview.isRhetorical()) {
        answer = Future.now(Option.of(interview.answer()));
      } else {
        answer = oracle(rule, interview).map((option) =>
          option.map((answer) => interview.answer(answer))
        );
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
