import { Node, Element } from "./types";
import { getParentElement } from "./get-parent-element";
import { getComputedStyle } from "./get-style";

/**
 * @see https://www.w3.org/TR/html/rendering.html#being-rendered
 * @see https://www.w3.org/TR/css-display/#css-box
 */
export function isRendered(element: Element, context: Node): boolean {
  for (
    let next: Element | null = element;
    next !== null;
    next = getParentElement(next, context)
  ) {
    const { display } = getComputedStyle(next, context);

    if (display !== undefined && "box" in display && display.box === "none") {
      return false;
    }
  }

  return true;
}
