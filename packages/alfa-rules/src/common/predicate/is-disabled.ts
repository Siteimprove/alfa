import { Element } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";

const { hasName } = Element;
const { some, find } = Iterable;
const { and, not, equals } = Predicate;

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
        .parent()
        .flatMap((parent) =>
          parent.closest(and(Element.isElement, hasName("fieldset")))
        )
        .filter(not(isDisabled))
        .flatMap((fieldset) =>
          find(
            fieldset.descendants(),
            and(Element.isElement, hasName("legend"))
          )
        )
        .some((legend) => some(legend.descendants(), equals(element)));

    // https://html.spec.whatwg.org/#attr-option-disabled
    case "option":
      if (element.attribute("disabled").isSome()) {
        return true;
      }

      return element
        .closest(and(Element.isElement, hasName("optgroup")))
        .some(isDisabled);

    // https://html.spec.whatwg.org/#attr-optgroup-disabled
    case "optgroup":
      return element.attribute("disabled").isSome();
  }

  return element
    .attribute("aria-disabled")
    .some((disabled) => disabled.value === "true");
};
