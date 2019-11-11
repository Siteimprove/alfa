import { Element, getInputType, InputType, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasInputType(
  context: Node,
  inputType: InputType
): Predicate<Element> {
  return element =>
    getInputType(element, context)
      .map(found => found === inputType)
      .getOr(false);
}
