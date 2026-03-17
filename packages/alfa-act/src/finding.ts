import { Either } from "@siteimprove/alfa-either";

import type { Diagnostic } from "./diagnostic.js";

/**
 * The result of an {@link Interview}: either a Conclusive finding (a final
 * answer was reached) or an Inconclusive one (more information is needed).
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

  export function inconclusive<DIAGNOSTIC extends Diagnostic>(
    diagnostic: DIAGNOSTIC,
    oracleUsed: boolean = false,
  ): Finding<never, DIAGNOSTIC> {
    return Either.right([diagnostic, oracleUsed]);
  }
}
