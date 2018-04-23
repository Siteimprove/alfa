import { Element } from "./types";
import { getTabIndex } from "./get-tab-index";

/**
 * @see https://www.w3.org/TR/html/editing.html#focusable
 */
export function isFocusable(element: Element): boolean {
  return getTabIndex(element) !== null;
}
