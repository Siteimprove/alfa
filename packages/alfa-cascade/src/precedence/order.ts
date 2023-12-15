import { Comparable, type Comparer } from "@siteimprove/alfa-comparable";

/**
 * Order of appearance of CSS rules in a sheet.
 *
 * @privateRemarks
 * While this just wraps `number`, having it as its own type streamlines
 * the rest of the code.
 *
 * @public
 */
export type Order = number;

/**
 * @public
 */
export namespace Order {
  export type JSON = Order;

  export const compare: Comparer<Order> = Comparable.compareNumber;
}
