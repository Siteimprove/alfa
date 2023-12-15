import { Comparable, type Comparer } from "@siteimprove/alfa-comparable";
import { Specificity } from "@siteimprove/alfa-selector/src/specificity";

import * as json from "@siteimprove/alfa-json";

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
  export interface JSON {
    [key: string]: json.JSON;
    origin: Origin.JSON;
    specificity: Specificity.JSON;
    order: Order.JSON;
  }

  export function toJSON(precedence: Precedence): JSON {
    return {
      origin: precedence.origin,
      specificity: precedence.specificity.toJSON(),
      order: precedence.order,
    };
  }
  export const compare: Comparer<Precedence> = (a, b) =>
    Comparable.compareLexicographically<[Origin, Specificity, Order]>(
      [a.origin, a.specificity, a.order],
      [b.origin, b.specificity, b.order],
      [Origin.compare, Specificity.compare, Order.compare],
    );
}
