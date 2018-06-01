import { Element } from "./types";
import { getInputType } from "./get-input-type";

/**
 * Given an element, check if the element can be associated with a form label.
 *
 * @see https://www.w3.org/TR/html/forms.html#labelable-element
 *
 * @example
 * const input = <input type="text" />;
 * isLabelable(input);
 * // => true
 *
 * @example
 * const div = <div />;
 * isLabelable(div);
 * // => false
 */
export function isLabelable(element: Element): boolean {
  switch (element.localName) {
    case "button":
    case "meter":
    case "output":
    case "progress":
    case "select":
    case "textarea":
      return true;

    case "input":
      return getInputType(element) !== "hidden";
  }

  return false;
}
