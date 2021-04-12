import { Predicate } from "@siteimprove/alfa-predicate";

import { Element } from "../../element";

const { equals } = Predicate;

/**
 * {@link https://html.spec.whatwg.org/#concept-fe-disabled}
 */
export function isDisabled(element: Element): boolean {
  switch (element.name) {
    // https://html.spec.whatwg.org/#attr-fe-disabled
    case "button":
    case "input":
    case "select":
    case "textarea":
    // https://html.spec.whatwg.org/#attr-fieldset-disabled
    case "fieldset":
      if (element.attribute("disabled").isSome()) {
        return true;
      }

      return element
        .ancestors()
        .filter(Element.isElement)
        .find(Element.hasName("fieldset"))
        .reject(isDisabled)
        .flatMap((fieldset) =>
          fieldset
            .descendants()
            .filter(Element.isElement)
            .find(Element.hasName("legend"))
        )
        .some((legend) => legend.descendants().some(equals(element)));

    // https://html.spec.whatwg.org/#attr-option-disabled
    case "option":
      if (element.attribute("disabled").isSome()) {
        return true;
      }

      return element
        .inclusiveAncestors()
        .filter(Element.isElement)
        .find(Element.hasName("optgroup"))
        .some(isDisabled);

    // https://html.spec.whatwg.org/#attr-optgroup-disabled
    case "optgroup":
      return element.attribute("disabled").isSome();
  }

  return false;
}
