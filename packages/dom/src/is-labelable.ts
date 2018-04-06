import { Element } from "./types";
import { getTag } from "./get-tag";
import { getAttribute } from "./get-attribute";

/**
 * @see https://www.w3.org/TR/html/forms.html#labelable-element
 */
export function isLabelable(element: Element): boolean {
  switch (getTag(element)) {
    case "button":
    case "meter":
    case "output":
    case "progress":
    case "select":
    case "textarea":
      return true;

    case "input":
      return getAttribute(element, "type") !== "hidden";
  }

  return false;
}
