import { Predicate } from "@siteimprove/alfa-predicate";

import { Element } from "../../element";

import { hasName } from "./has-name";

const { equals } = Predicate;
const { isElement } = Element;

/**
 * @see https://html.spec.whatwg.org/#concept-fe-disabled
 */
export const isDisabled: Predicate<Element> = (element) => {
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
        .filter(isElement)
        .find(hasName("fieldset"))
        .reject(isDisabled)
        .flatMap((fieldset) =>
          fieldset.descendants().filter(isElement).find(hasName("legend"))
        )
        .some((legend) => legend.descendants().some(equals(element)));

    // https://html.spec.whatwg.org/#attr-option-disabled
    case "option":
      if (element.attribute("disabled").isSome()) {
        return true;
      }

      return element
        .inclusiveAncestors()
        .filter(isElement)
        .find(hasName("optgroup"))
        .some(isDisabled);

    // https://html.spec.whatwg.org/#attr-optgroup-disabled
    case "optgroup":
      return element.attribute("disabled").isSome();
  }

  return false;
};
