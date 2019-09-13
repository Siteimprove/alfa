import { contains } from "./contains";
import { getClosest } from "./get-closest";
import { getParentElement } from "./get-parent-element";
import { hasAttribute } from "./has-attribute";
import { querySelector } from "./query-selector";
import { Element, Node } from "./types";

/**
 * Given an element and a context, check if the element is disabled within the
 * context.
 *
 * @see https://html.spec.whatwg.org/#concept-fe-disabled
 */
export function isDisabled(element: Element, context: Node): boolean {
  switch (element.localName) {
    // https://html.spec.whatwg.org/#attr-fe-disabled
    case "button":
    case "input":
    case "select":
    case "textarea":
    // https://html.spec.whatwg.org/#attr-fieldset-disabled
    case "fieldset":
      if (hasAttribute(element, "disabled")) {
        return true;
      }

      const parentElement = getParentElement(element, context);

      if (parentElement === null) {
        return false;
      }

      const fieldset = getClosest(parentElement, context, "fieldset");

      if (fieldset === null || !isDisabled(fieldset, context)) {
        return false;
      }

      const legend = querySelector(fieldset, context, "legend");

      return legend !== null && !contains(legend, context, element);

    // https://html.spec.whatwg.org/#attr-option-disabled
    case "option":
      if (hasAttribute(element, "disabled")) {
        return true;
      }

      const optgroup = getClosest(element, context, "optgroup");

      return optgroup !== null && isDisabled(optgroup, context);

    // https://html.spec.whatwg.org/#attr-optgroup-disabled
    case "optgroup":
      return hasAttribute(element, "disabled");
  }

  return false;
}
