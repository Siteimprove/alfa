import { getInputType, InputType } from "./get-input-type";
import { Element, Node } from "./types";

/**
 * Given an element, check if the element can be associated with a form label.
 *
 * @see https://html.spec.whatwg.org/#category-label
 *
 * @example
 * const input = <input type="text" />;
 * isLabelable(input, input);
 * // => true
 *
 * @example
 * const div = <div />;
 * isLabelable(div, div);
 * // => false
 */
export function isLabelable(element: Element, context: Node): boolean {
  switch (element.localName) {
    case "button":
    case "meter":
    case "output":
    case "progress":
    case "select":
    case "textarea":
      return true;

    case "input":
      return getInputType(element, context)
        .map(inputType => inputType !== InputType.Hidden)
        .getOr(true);
  }

  return false;
}
