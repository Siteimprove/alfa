import { Element } from "./types";
import { getTabIndex } from "./get-tab-index";

export function isInert(element: Element): boolean {
  return getTabIndex(element) === null;
}
