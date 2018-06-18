import { Element } from "./types";
import { getClassList } from "./get-class-list";

/**
 * Given an element, check if the element has the specified class name.
 */
export function hasClass(element: Element, className: string): boolean {
  const classList = getClassList(element);

  for (let i = 0, n = classList.length; i < n; i++) {
    if (classList[i] === className) {
      return true;
    }
  }

  return false;
}
