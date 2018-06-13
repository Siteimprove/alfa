import { Element, Node } from "./types";
import { isFocusable } from "./is-focusable";
import { getTabIndex } from "./get-tab-index";

/**
 * Check if an element is tabbable within a given context. An element is
 * considered tabbable if it is focusable and does not have a negative tab
 * index.
 */
export function isTabbable(element: Element, context: Node): boolean {
  if (!isFocusable(element, context)) {
    return false;
  }

  const tabIndex = getTabIndex(element);

  return tabIndex !== null && tabIndex >= 0;
}
