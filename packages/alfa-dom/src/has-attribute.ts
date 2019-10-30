import { getAttribute } from "./get-attribute";
import { Element, Node } from "./types";

/**
 * Given an element, check if the element has the specified attribute.
 */
export function hasAttribute(
  element: Element,
  context: Node,
  name: string
): boolean {
  return getAttribute(element, context, name).isSome();
}
