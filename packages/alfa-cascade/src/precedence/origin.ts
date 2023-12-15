import { Comparable, type Comparer } from "@siteimprove/alfa-comparable";

/**
 * Cascading origins defined in ascending order; origins defined first have
 * lower precedence than origins defined later.
 *
 * {@link https://www.w3.org/TR/css-cascade-5/#cascading-origins}
 *
 * @public
 */
export enum Origin {
  /**
   * {@link https://www.w3.org/TR/css-cascade-5/#cascade-origin-ua}
   */
  UserAgent = 1,

  /**
   * {@link https://www.w3.org/TR/css-cascade-5/#cascade-origin-author}
   */
  Author = 2,
}

/**
 * @public
 */
export namespace Origin {
  export type JSON = Origin;

  export const compare: Comparer<Origin> = Comparable.compareNumber;
}
