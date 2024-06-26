import { Array } from "@siteimprove/alfa-array";
import type { Predicate } from "@siteimprove/alfa-predicate";

import type { Element } from "../../element.js";

/**
 * @public
 */
export function hasTabIndex(predicate?: Predicate<number>): Predicate<Element>;

/**
 * @public
 */
export function hasTabIndex(
  value: number,
  ...rest: Array<number>
): Predicate<Element>;

/**
 * @public
 */
export function hasTabIndex(
  predicateOrNumber: Predicate<number> | number = () => true,
  ...rest: Array<number>
): Predicate<Element> {
  const predicate =
    typeof predicateOrNumber === "number"
      ? (n: number) => Array.append(rest, predicateOrNumber).includes(n)
      : predicateOrNumber;

  return (element) => element.tabIndex().some(predicate);
}
