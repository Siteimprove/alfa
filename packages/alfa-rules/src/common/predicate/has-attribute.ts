import { Element, getAttribute, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasAttribute(
  context: Node,
  attribute: string,
  predicate: Predicate<string> = () => true
): Predicate<Element> {
  return element =>
    getAttribute(element, context, attribute)
      .filter(predicate)
      .isSome();
}
