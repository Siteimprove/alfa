import { Element, getTabIndex, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasTabIndex(
  context: Node,
  predicate: Predicate<number> = () => true
): Predicate<Element> {
  return element =>
    getTabIndex(element, context)
      .filter(predicate)
      .isSome();
}
