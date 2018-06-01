import { Element } from "./types";
import { getAttribute } from "./get-attribute";

/**
 * Given an element, check if the element has the specified attribute.
 *
 * @example
 * const div = <div title="Foo" />;
 * hasAttribute(div, "title");
 * // => true
 *
 * @param element
 * @param name
 * @return
 */
export function hasAttribute(element: Element, name: string): boolean {
  return getAttribute(element, name) !== null;
}
