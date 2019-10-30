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
      if (hasAttribute(element, context, "disabled")) {
        return true;
      }

      return getParentElement(element, context)
        .flatMap(parentElement =>
          getClosest(parentElement, context, "fieldset")
        )
        .filter(fieldset => !isDisabled(fieldset, context))
        .flatMap(fieldset => querySelector(fieldset, context, "legend"))
        .map(legend => !contains(legend, context, element))
        .getOr(false);

    // https://html.spec.whatwg.org/#attr-option-disabled
    case "option":
      if (hasAttribute(element, context, "disabled")) {
        return true;
      }

      return getClosest(element, context, "optgroup")
        .map(optgroup => isDisabled(optgroup, context))
        .getOr(false);

    // https://html.spec.whatwg.org/#attr-optgroup-disabled
    case "optgroup":
      return hasAttribute(element, context, "disabled");
  }

  return false;
}
