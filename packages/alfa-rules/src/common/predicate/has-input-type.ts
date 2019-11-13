import { Element, getInputType, InputType, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasInputType(
  context: Node,
  predicate: Predicate<InputType> = () => true
): Predicate<Element> {
  return element =>
    getInputType(element, context)
      .filter(predicate)
      .isSome();
}
