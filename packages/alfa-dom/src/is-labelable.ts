import { getInputType, InputType } from "./get-input-type";
import { Element } from "./types";

/**
 * Given an element, check if the element can be associated with a form label.
 *
 * @see https://html.spec.whatwg.org/#category-label
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
      return getInputType(element) !== InputType.Hidden;
  }

  return false;
}
