import { getTabIndex } from "./get-tab-index";
import { isDisabled } from "./is-disabled";
import { isRendered } from "./is-rendered";
import { Element, Node } from "./types";

/**
 * Given an element and a context, check if the element is focusable within the
 * context.
 *
 * @see https://www.w3.org/TR/html/editing.html#focusable
 */
export function isFocusable(element: Element, context: Node): boolean {
  return (
    getTabIndex(element) !== null &&
    !isDisabled(element, context) &&
    isRendered(element, context)
  );
}
