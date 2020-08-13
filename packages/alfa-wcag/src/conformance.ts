import { Criterion } from "./criterion";

/**
 * @see https://www.w3.org/TR/WCAG/#conformance
 */
export namespace Conformance {
  export type A = Criterion.A;

  export type AA = Criterion.A | Criterion.AA;

  export type AAA = Criterion.A | Criterion.AA | Criterion.AAA;
}
