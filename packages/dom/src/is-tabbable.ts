import { Element } from "./types";
import { getTabIndex } from "./get-tab-index";

export function isTabbable(element: Element): boolean {
  const tabIndex = getTabIndex(element);
  return tabIndex !== null && tabIndex >= 0;
}
