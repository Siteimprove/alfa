import { Predicate } from "@siteimprove/alfa-predicate";

import { Element } from "../../element";

/**
 * @public
 */
export function hasTabIndex(
  predicate: Predicate<number> = () => true
): Predicate<Element> {
  return (element) => element.tabIndex().some(predicate);
}
