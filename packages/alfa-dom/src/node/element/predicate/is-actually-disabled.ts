import { Predicate } from "@siteimprove/alfa-predicate";

import { Element } from "../../element";

const { equals } = Predicate;

/**
 * {@link https://html.spec.whatwg.org/multipage#concept-element-disabled}
 *
 * @public
 */
export function isActuallyDisabled(element: Element): boolean {
  switch (element.name) {
    // https://html.spec.whatwg.org/multipage#concept-fe-disabled
    case "button":
    case "input":
    case "select":
    case "textarea":
    // https://html.spec.whatwg.org/#attr-optgroup-disabled
    case "optgroup":
      return element.attribute("disabled").isSome();
    // https://html.spec.whatwg.org/multipage#concept-fieldset-disabled
    case "fieldset":
      if (element.attribute("disabled").isSome()) {
        return true;
      }

      return element
        .ancestors()
        .filter(Element.isElement)
        .find(Element.hasName("fieldset"))
        .reject(isActuallyDisabled)
        .flatMap((fieldset) =>
          fieldset
            .descendants()
            .filter(Element.isElement)
            .find(Element.hasName("legend"))
        )
        .some((legend) => legend.descendants().some(equals(element)));

    // https://html.spec.whatwg.org/multipage#concept-option-disabled
    case "option":
      if (element.attribute("disabled").isSome()) {
        return true;
      }

      return element
        .inclusiveAncestors()
        .filter(Element.isElement)
        .find(Element.hasName("optgroup"))
        .some(isActuallyDisabled);
  }

  return false;
}
