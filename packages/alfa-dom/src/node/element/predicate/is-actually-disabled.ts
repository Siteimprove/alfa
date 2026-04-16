import { Predicate } from "@siteimprove/alfa-predicate";
import type { Refinement } from "@siteimprove/alfa-refinement";

import type { Element } from "../../slotable/element.ts";

import { hasName } from "./has-name.ts";

const { equals } = Predicate;

/**
 * {@link https://html.spec.whatwg.org/multipage#concept-element-disabled}
 *
 * @public
 */
export function isActuallyDisabled(
  isElement: Refinement<unknown, Element>,
): Predicate<Element> {
  return function isActuallyDisabled(element): boolean {
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
          .filter(isElement)
          .find(hasName("fieldset"))
          .reject(isActuallyDisabled)
          .flatMap((fieldset) =>
            fieldset.descendants().filter(isElement).find(hasName("legend")),
          )
          .some((legend) => legend.descendants().some(equals(element)));

      // https://html.spec.whatwg.org/multipage#concept-option-disabled
      case "option":
        if (element.attribute("disabled").isSome()) {
          return true;
        }

        return element
          .inclusiveAncestors()
          .filter(isElement)
          .find(hasName("optgroup"))
          .some(isActuallyDisabled);
    }

    return false;
  };
}
