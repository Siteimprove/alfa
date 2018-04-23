import { Element } from "./types";

/**
 * Given an element, get the normalized tag name of the element.
 *
 * @example
 * const div = <div />;
 * getTag(div);
 * // => "div"
 *
 * @example
 * const div = <DIV />;
 * getTag(div);
 * // => "div"
 */
export function getTag(element: Element): string {
  return element.tagName.toLowerCase();
}
