import { Either } from "@siteimprove/alfa-either";
import type { Hashable } from "@siteimprove/alfa-hash";
import { Option } from "@siteimprove/alfa-option";
import { Tuple } from "@siteimprove/alfa-tuple";

import type { Diagnostic } from "./diagnostic.js";
import type { Oracle } from "./oracle.js";
import { Question } from "./question.js";
import type { Rule } from "./rule.js";

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
 * An Interview is either a direct ANSWER; or a question who is ultimately going
 * to produce one, possibly through more questions (aka, an Interview).
 *
 * The QUESTION type maps questions' URI to the expected type of answer, both as
 * a JavaScript manipulable representation (T), and an actual type (A).
 * The SUBJECT and CONTEXT types are the subject and context of the question.
 */
export type Interview<
  QUESTION extends Question.Metadata,
  SUBJECT,
  CONTEXT,
  ANSWER,
  D extends number = Interview.MaxDepth,
> =
  | ANSWER
  | {
      [URI in keyof QUESTION]: Question<
        QUESTION[URI][0],
        SUBJECT,
        CONTEXT,
        QUESTION[URI][1],
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
  /**
   * @internal
   */
  export type MaxDepth = 3;

  /**
   *  Conduct an interview:
   *  * if it is an answer, just send it back;
   *  * if it is a rhetorical question, fetch its answer and recursively conduct
   *    an interview on it;
   *  * if it is a true question, ask it to the oracle and recursively conduct an
   *    interview on the result.
   *
   *  Oracles must return Options, to have the possibility to not answer a given
   *  question (by returning None).
   *  Oracles must return Futures, because the full interview process is essentially
   *  async (e.g., asking through a CLI).
   *
   *  The final result of the interview is either a final answer (Left), or
   *  a diagnostic (Right) explaining why a final answer couldn't be found.
   *  Final answer will be turned into Passed/Failed outcomes, and diagnostic
   *  into Can't tell; the diagnostic is provided by the last unanswered question.
   *
   *  In both cases, we also record whether the oracle was actually used;
   *  this is useful to record the mode (auto/semi-auto) of the outcome.
   */
  export function conduct<
    INPUT,
    TARGET extends Hashable,
    QUESTION extends Question.Metadata,
    SUBJECT,
    ANSWER,
  >(
    // Questions' contexts are guaranteed to be (potential) test target of
    // the rule.
    interview: Interview<QUESTION, SUBJECT, TARGET, ANSWER>,
    rule: Rule<INPUT, TARGET, QUESTION, SUBJECT>,
    oracle: Oracle<INPUT, TARGET, QUESTION, SUBJECT>,
    oracleUsed: boolean = false,
  ): Either<Tuple<[ANSWER, boolean]>, Tuple<[Diagnostic, boolean]>> {
    if (interview instanceof Question) {
      let answer: Option<Interview<QUESTION, SUBJECT, TARGET, ANSWER>>;

      if (interview.isRhetorical()) {
        answer = Option.of(interview.answer());
      } else {
        answer = oracle(rule, interview)
          // Record that the oracle was successfully used
          .tee((_) => (oracleUsed = true))
          // If oracle has no answer, use fallback
          .or(interview.fallback)
          // Need to bind due to eta-contraction losing `this`.
          .map(interview.answer.bind(interview));
      }

      return answer
        .map((answer) => conduct(answer, rule, oracle, oracleUsed))
        .getOrElse(() =>
          Either.right(Tuple.of(interview.diagnostic, oracleUsed)),
        );
    }

    // The interview is not a question, so it is a final answer.
    return Either.left(Tuple.of(interview, oracleUsed));
  }
}
