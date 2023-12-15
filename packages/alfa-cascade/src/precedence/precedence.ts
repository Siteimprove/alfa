import { Comparable, type Comparer } from "@siteimprove/alfa-comparable";
import { Specificity } from "@siteimprove/alfa-selector/src/specificity";
import { Order } from "./order";
import { Origin } from "./origin";

/**
 * Store the various components needed for precedence in the Cascade Sorting Order.
 *
 * {@link https://drafts.csswg.org/css-cascade-5/#cascade-sort}
 *
 * @public
 */
export interface Precedence {
  origin: Origin;
  specificity: Specificity;
  order: Order;
}

/**
 * {@link https://drafts.csswg.org/css-cascade-5/#cascade-sort}
 *
 * @public
 */
export namespace Precedence {
  export const comparer: Comparer<Precedence> = (a, b) =>
    Comparable.compareLexicographically<[Origin, Specificity, Order]>(
      [a.origin, a.specificity, a.order],
      [b.origin, b.specificity, b.order],
      [Origin.compare, Specificity.compare, Order.compare],
    );
}
