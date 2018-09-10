import { getTabIndex } from "./get-tab-index";
import { isFocusable } from "./is-focusable";
import { Element, Node } from "./types";

/**
 * Given an element and a context, check if the element is tabbable within the
 * context. An element is considered tabbable if it is focusable and does not
 * have a negative tab index.
 */
export function isTabbable(element: Element, context: Node): boolean {
  if (!isFocusable(element, context)) {
    return false;
  }

  const tabIndex = getTabIndex(element, context);

  return tabIndex !== null && tabIndex >= 0;
}
