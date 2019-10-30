import { Iterable } from "@siteimprove/alfa-iterable";
import { getClassList } from "./get-class-list";
import { Element, Node } from "./types";

/**
 * Given an element, check if the element has the specified class name.
 */
export function hasClass(
  element: Element,
  context: Node,
  className: string
): boolean {
  return Iterable.includes(getClassList(element, context), className);
}
