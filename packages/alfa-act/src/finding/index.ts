import { Refinement } from "@siteimprove/alfa-refinement";

import type { Diagnostic } from "../diagnostic.js";

import { Conclusive } from "./conclusive.js";
import { Inconclusive } from "./inconclusive.js";

/**
 * The result of an {@link Interview}: either a {@link (Finding:namespace).Conclusive}
 * (a final answer was reached) or an {@link (Finding:namespace).Inconclusive}
 * (more information is needed).
 *
 * @public
 */
export type Finding<ANSWER, DIAGNOSTIC extends Diagnostic = Diagnostic> =
  | Conclusive<ANSWER>
  | Inconclusive<DIAGNOSTIC>;

/**
 * @public
 */
export namespace Finding {
  export type JSON<
    ANSWER = unknown,
    DIAGNOSTIC extends Diagnostic = Diagnostic,
  > = Conclusive.JSON<ANSWER> | Inconclusive.JSON<DIAGNOSTIC>;

  export const { of: conclusive, isConclusive } = Conclusive;
  export const { of: inconclusive, isInconclusive } = Inconclusive;

  export const isFinding = Refinement.or(isConclusive, isInconclusive);
}
