import { getAttribute } from "./get-attribute";
import { Element } from "./types";

/**
 * Given an element, check if the element has the specified attribute.
 *
 * @example
 * const div = <div title="Foo" />;
 * hasAttribute(div, "title");
 * // => true
 */
export function hasAttribute(element: Element, name: string): boolean {
  return getAttribute(element, name) !== null;
}
