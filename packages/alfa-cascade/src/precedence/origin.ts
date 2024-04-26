import { Comparable, type Comparer } from "@siteimprove/alfa-comparable";

/**
 * {@link https://www.w3.org/TR/css-cascade-5/#cascading-origins}
 * {@link https://www.w3.org/TR/css-cascade-5/#cascade-origin}
 *
 * @remarks
 * This enumeration mixes both Origin and importance because importance
 * reverses the comparison of some (but not all) origins in cascade sorting.
 * Mixing both here allows for the comparison to be simple number comparison,
 * which should be faster than looking at more than one field.
 *
 * Cascading origins are defined in ascending order; origins defined first have
 * lower precedence than origins defined later. Thus, an origin with higher
 * value takes precedence over an origin with lower value. This means that
 * comparing origins is the same as comparing numbers.
 *
 * @public
 */
export enum Origin {
  /**
   * {@link https://www.w3.org/TR/css-cascade-5/#cascade-origin-ua}
   */
  NormalUserAgent = 1,

  /**
   * {@link https://www.w3.org/TR/css-cascade-5/#cascade-origin-user}
   */
  NormalUser = 2,

  /**
   * {@link https://www.w3.org/TR/css-cascade-5/#cascade-origin-author}
   */
  NormalAuthor = 3,

  /**
   * {@link https://www.w3.org/TR/css-cascade-5/#cascade-origin-animation}
   */

  Animation = 4,

  ImportantAuthor = 5,

  ImportantUser = 6,

  ImportantUserAgent = 7,

  /**
   * {@link https://www.w3.org/TR/css-cascade-5/#cascade-origin-transition}
   */
  Transition = 8,
}

/**
 * @public
 */
export namespace Origin {
  export type JSON = Origin;

  export function isImportant(origin: Origin): boolean {
    return (
      Origin.ImportantAuthor <= origin && origin <= Origin.ImportantUserAgent
    );
  }

  export function isAuthor(origin: Origin): boolean {
    return origin === Origin.NormalAuthor || origin === Origin.ImportantAuthor;
  }

  export const compare: Comparer<Origin> = Comparable.compareNumber;
}
