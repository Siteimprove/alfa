import { getClassList } from "./get-class-list";
import { Element } from "./types";

/**
 * Given an element, check if the element has the specified class name.
 */
export function hasClass(element: Element, className: string): boolean {
  for (const found of getClassList(element)) {
    if (found === className) {
      return true;
    }
  }

  return false;
}
