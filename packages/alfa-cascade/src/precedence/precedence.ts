import type { Comparison } from "@siteimprove/alfa-comparable";
import type { Specificity } from "@siteimprove/alfa-selector/src/specificity";
import type { Origin } from "./origin";

/**
 * Store the varuipous components needed for precedence in the Cascade Sorting Order.
 *
 * {@link https://drafts.csswg.org/css-cascade-5/#cascade-sort}
 *
 * @public
 */
export interface Precedence {
  origin: Origin;
  specificity: Specificity;
  order: number;
}

/**
 * @public
 */
export namespace Precedence {
  export function comparer(a: Precedence, b: Precedence): Comparison {
    // First priority: Origin
    if (a.origin !== b.origin) {
      return a.origin < b.origin ? -1 : a.origin > b.origin ? 1 : 0;
    }

    // Second priority: Specificity.
    if (a.specificity.value !== b.specificity.value) {
      return a.specificity.value < b.specificity.value
        ? -1
        : a.specificity.value > b.specificity.value
          ? 1
          : 0;
    }

    // Third priority: Order.
    return a.order < b.order ? -1 : a.order > b.order ? 1 : 0;
  }
}
