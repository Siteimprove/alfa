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
  // Origin also contains importance for faster comparison.
  origin: Origin;
  // TODO: encapsulation context
  // Do the declarations come from a style attribute?
  isElementAttached: boolean;
  // TODO: layers
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
    isElementAttached: boolean;
    specificity: Specificity.JSON;
    order: Order.JSON;
  }

  export function toJSON(precedence: Precedence): JSON {
    return {
      origin: precedence.origin,
      isElementAttached: precedence.isElementAttached,
      specificity: precedence.specificity.toJSON(),
      order: precedence.order,
    };
  }

  export function toTuple(
    precedence: Precedence,
  ): [Origin, boolean, Specificity, Order] {
    return [
      precedence.origin,
      precedence.isElementAttached,
      precedence.specificity,
      precedence.order,
    ];
  }
  export const compare: Comparer<Precedence> = (a, b) =>
    Comparable.compareLexicographically(toTuple(a), toTuple(b), [
      Origin.compare,
      // In JS, true > false. This matches the behaviour of declarations from
      // a style attribute (isElementAttached = true) taking precedence over
      // declarations from a style rule.
      Comparable.compareBoolean,
      Specificity.compare,
      Order.compare,
    ]);
}
