import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasTabIndex(
  predicate: Predicate<number> = () => true
): Predicate<Element> {
  return element => element.tabIndex().some(predicate);
}
