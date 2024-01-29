import { Comparable, type Comparer } from "@siteimprove/alfa-comparable";
import { Specificity } from "@siteimprove/alfa-selector/src/specificity";

import * as json from "@siteimprove/alfa-json";

import { Encapsulation } from "./encapsulation";
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
  // Encapsulation also contains importance for faster comparison.
  encapsulation: Encapsulation;
  // Do the declarations come from a style attribute?
  // {@link https://drafts.csswg.org/css-cascade-5/#style-attr}
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
    encapsulation: Encapsulation.JSON;
    isElementAttached: boolean;
    specificity: Specificity.JSON;
    order: Order.JSON;
  }

  export function toJSON(precedence: Precedence): JSON {
    return {
      origin: precedence.origin,
      encapsulation: precedence.encapsulation,
      isElementAttached: precedence.isElementAttached,
      specificity: precedence.specificity.toJSON(),
      order: precedence.order,
    };
  }

  export function toTuple(
    precedence: Precedence,
  ): [Origin, Encapsulation, boolean, Specificity, Order] {
    return [
      precedence.origin,
      precedence.encapsulation,
      precedence.isElementAttached,
      precedence.specificity,
      precedence.order,
    ];
  }
  export const compare: Comparer<Precedence> = (a, b) =>
    Comparable.compareLexicographically(toTuple(a), toTuple(b), [
      Origin.compare,
      Encapsulation.compare,
      // In JS, true > false. This matches the behaviour of declarations from
      // a style attribute (isElementAttached = true) taking precedence over
      // declarations from a style rule.
      Comparable.compareBoolean,
      Specificity.compare,
      Order.compare,
    ]);
}
