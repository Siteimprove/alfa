import type { Predicate } from "@siteimprove/alfa-predicate";

import type { Element } from "../../element.js";

/**
 * @public
 */
export function hasDisplaySize(
  valueOrPredicate: number | Predicate<number>,
): Predicate<Element<"select">> {
  const predicate =
    typeof valueOrPredicate === "function"
      ? valueOrPredicate
      : (size: number) => valueOrPredicate === size;

  return (element) => {
    return predicate(element.displaySize());
  };
}
