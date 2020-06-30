import { Element } from "../../element";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasTabIndex(
  predicate: Predicate<number> = () => true
): Predicate<Element> {
  return (element) => element.tabIndex().some(predicate);
}
