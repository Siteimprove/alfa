import type { Comparer, Comparison } from "@siteimprove/alfa-comparable";
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
  // specificity: Specificity;
  specificity: number;
  order: number;
}

/**
 * {@link https://drafts.csswg.org/css-cascade-5/#cascade-sort}
 *
 * @public
 */
export namespace Precedence {
  export const comparer: Comparer<Precedence> = (a, b) => {
    // First priority: Origin
    if (a.origin !== b.origin) {
      return a.origin < b.origin ? -1 : a.origin > b.origin ? 1 : 0;
    }

    // Second priority: Specificity.
    // if (a.specificity.value !== b.specificity.value) {
    //   return a.specificity.value < b.specificity.value
    //     ? -1
    //     : a.specificity.value > b.specificity.value
    //       ? 1
    //       : 0;
    // }
    if (a.specificity !== b.specificity) {
      return a.specificity < b.specificity
        ? -1
        : a.specificity > b.specificity
          ? 1
          : 0;
    }

    // Third priority: Order.
    return a.order < b.order ? -1 : a.order > b.order ? 1 : 0;
  };
}
