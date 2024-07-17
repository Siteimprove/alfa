import { Comparable, type Comparer } from "@siteimprove/alfa-comparable";
import { Specificity } from "@siteimprove/alfa-selector";

import type * as json from "@siteimprove/alfa-json";

import { Encapsulation } from "./encapsulation.js";
import { Layer } from "./layer.js";
import { Order } from "./order.js";
import { Origin } from "./origin.js";

/**
 * Store the various components needed for precedence in the Cascade Sorting Order.
 *
 * {@link https://drafts.csswg.org/css-cascade-5/#cascade-sort}
 *
 * @public
 */
export interface Precedence<LAYERED extends boolean = boolean> {
  // Origin also contains importance for faster comparison.
  origin: Origin;
  // Encapsulation also contains importance for faster comparison.
  encapsulation: Encapsulation;
  // Do the declarations come from a style attribute?
  // {@link https://drafts.csswg.org/css-cascade-5/#style-attr}
  isElementAttached: boolean;
  layer: Layer<LAYERED>;
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
    layer: Layer.JSON;
    specificity: Specificity.JSON;
    order: Order.JSON;
  }

  export const empty: Precedence<true> = {
    origin: Origin.NormalUserAgent,
    encapsulation: -1 /* outermost normal */,
    isElementAttached: false,
    layer: Layer.empty(),
    specificity: Specificity.empty(),
    order: -Infinity,
  };

  export function toJSON(precedence: Precedence): JSON {
    return {
      origin: precedence.origin,
      encapsulation: precedence.encapsulation,
      isElementAttached: precedence.isElementAttached,
      layer: precedence.layer.toJSON(),
      specificity: precedence.specificity.toJSON(),
      order: precedence.order,
    };
  }

  export function isImportant<LAYERED extends boolean>(
    precedence: Precedence<LAYERED>,
  ): boolean {
    return Origin.isImportant(precedence.origin);
  }

  export function toTuple<LAYERED extends boolean>(
    precedence: Precedence<LAYERED>,
  ): [Origin, Encapsulation, boolean, Layer<LAYERED>, Specificity, Order] {
    return [
      precedence.origin,
      precedence.encapsulation,
      precedence.isElementAttached,
      precedence.layer,
      precedence.specificity,
      precedence.order,
    ];
  }

  export function equals(a: Precedence, b: Precedence) {
    return (
      a.origin === b.origin &&
      a.encapsulation === b.encapsulation &&
      a.isElementAttached === b.isElementAttached &&
      a.layer.equals(b.layer) &&
      a.specificity.equals(b.specificity) &&
      a.order === b.order
    );
  }

  export const compare: Comparer<Precedence<true>> = (a, b) =>
    Comparable.compareLexicographically(toTuple(a), toTuple(b), [
      Origin.compare,
      Encapsulation.compare,
      // In JS, true > false. This matches the behaviour of declarations from
      // a style attribute (isElementAttached = true) taking precedence over
      // declarations from a style rule.
      Comparable.compareBoolean,
      Layer.compare,
      Specificity.compare,
      Order.compare,
    ]);
}
