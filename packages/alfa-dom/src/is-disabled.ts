import { contains } from "./contains";
import { getClosest } from "./get-closest";
import { hasAttribute } from "./has-attribute";
import { querySelector } from "./query-selector";
import { Element, Node } from "./types";

/**
 * Given an element and a context, check if the element is disabled within the
 * context.
 *
 * @see https://www.w3.org/TR/html/disabled-elements.html#disabling
 */
export function isDisabled(element: Element, context: Node): boolean {
  switch (element.localName) {
    // https://www.w3.org/TR/html/sec-forms.html#element-attrdef-disabledformelements-disabled
    case "button":
    case "input":
    case "select":
    case "textarea":
    // https://www.w3.org/TR/html/sec-forms.html#element-attrdef-fieldset-disabled
    case "fieldset":
      if (hasAttribute(element, "disabled")) {
        return true;
      }

      const fieldset = getClosest(element, context, "fieldset");

      if (fieldset === null || !isDisabled(fieldset, context)) {
        return false;
      }

      const legend = querySelector(fieldset, context, "legend");

      return legend !== null && !contains(legend, context, element);
    // https://www.w3.org/TR/html/sec-forms.html#element-attrdef-option-disabled
    case "option":
      if (hasAttribute(element, "disabled")) {
        return true;
      }

      const optgroup = getClosest(element, context, "optgroup");

      return optgroup !== null && isDisabled(optgroup, context);
    // https://www.w3.org/TR/html/sec-forms.html#element-attrdef-optgroup-disabled
    case "optgroup":
      return hasAttribute(element, "disabled");
  }

  return false;
}
