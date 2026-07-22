import { Either, type Left, type Right } from "@siteimprove/alfa-either";

import type { Diagnostic } from "./diagnostic.ts";

/**
 * The result of an Interview: either a Conclusive finding (a final answer was
 * reached) or an Inconclusive one (more information is needed).
 *
 * @public
 */
export type Finding<
  ANSWER,
  DIAGNOSTIC extends Diagnostic = Diagnostic,
> = Either<[ANSWER, boolean], [DIAGNOSTIC, boolean]>;

/**
 * @public
 */
export namespace Finding {
  export function conclusive<ANSWER>(
    answer: ANSWER,
    oracleUsed: boolean = false,
  ): Finding<ANSWER> {
    return Either.left([answer, oracleUsed]);
  }

  export function isConclusive<A>(
    finding: Finding<A>,
  ): finding is Left<[A, boolean]> {
    return finding.isLeft();
  }

  export function inconclusive<DIAGNOSTIC extends Diagnostic>(
    diagnostic: DIAGNOSTIC,
    oracleUsed: boolean = false,
  ): Finding<never, DIAGNOSTIC> {
    return Either.right([diagnostic, oracleUsed]);
  }

  export function isInconclusive<D extends Diagnostic>(
    finding: Finding<unknown, D>,
  ): finding is Right<[D, boolean]> {
    return finding.isRight();
  }
}
