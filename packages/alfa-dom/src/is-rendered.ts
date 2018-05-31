import { Node, Element } from "./types";
import { getParentElement } from "./get-parent-element";
import { getComputedStyle } from "./get-style";

/**
 * Check if an element is being rendered within a given context. An element is
 * considered as being rendered if it generates layout boxes.
 *
 * @see https://www.w3.org/TR/html/rendering.html#being-rendered
 *
 * @example
 * const span = <span />;
 * isRendered(span, <div style="display: none">{span}</div>);
 * // => false
 */
export function isRendered(element: Element, context: Node): boolean {
  for (
    let next: Element | null = element;
    next !== null;
    next = getParentElement(next, context)
  ) {
    if (getComputedStyle(next, context).display === "none") {
      return false;
    }
  }

  return true;
}
