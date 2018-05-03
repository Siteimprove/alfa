import { Node, Element } from "./types";
import { getAttribute } from "./get-attribute";
import { closest } from "./closest";
import { find } from "./find";
import { contains } from "./contains";

/**
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
      if (getAttribute(element, "disabled") !== null) {
        return true;
      }

      const fieldset = closest(element, context, "fieldset");

      if (fieldset === null || !isDisabled(fieldset, context)) {
        return false;
      }

      const legend = find(fieldset, context, "legend");

      return legend !== null && !contains(legend, context, element);
    // https://www.w3.org/TR/html/sec-forms.html#element-attrdef-option-disabled
    case "option":
      if (getAttribute(element, "disabled") !== null) {
        return true;
      }

      const optgroup = closest(element, context, "optgroup");

      return optgroup !== null && isDisabled(optgroup, context);
    // https://www.w3.org/TR/html/sec-forms.html#element-attrdef-optgroup-disabled
    case "optgroup":
      return getAttribute(element, "disabled") !== null;
  }

  return false;
}
