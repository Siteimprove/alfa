import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Attribute, Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasAttribute } from "../common/predicate/has-attribute";
import { hasRole } from "../common/predicate/has-role";
import { isPerceivable } from "../common/predicate/is-perceivable";
import { isTabbable } from "../common/predicate/is-tabbable";

const { isElement, hasInputType, hasName, hasNamespace } = Element;
const { and, or, not, equals } = Predicate;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r10.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(
            and(
              isElement,
              and(
                hasAttribute("autocomplete", hasTokens),
                hasNamespace(Namespace.HTML),
                hasName("input", "select", "textarea"),
                isPerceivable(device),
                not(
                  and(
                    hasName("input"),
                    hasInputType("hidden", "button", "submit", "reset")
                  )
                ),
                not(hasAttribute("aria-disabled", equals("true"))),
                or(
                  isTabbable(device),
                  hasRole((role) => role.isWidget())
                )
              )
            )
          )
          .map((element) => element.attribute("autocomplete").get());
      },

      expectations(target) {
        return {
          1: expectation(
            isValidAutocomplete(target),
            () => Outcomes.HasValidValue,
            () => Outcomes.HasNoValidValue
          ),
        };
      },
    };
  },
});

function hasTokens(input: string): boolean {
  return input.trim() !== "" && input.split(/\s+/).length > 0;
}

const isValidAutocomplete: Predicate<Attribute> = (autocomplete) => {
  const tokens = autocomplete.value.toLowerCase().trim().split(/\s+/);

  let i = 0;
  let next = tokens[i++];

  if (next === undefined) {
    return false;
  }

  if (next === "on" || next === "off") {
    return tokens.length === 1;
  }

  if (next.startsWith("section-")) {
    next = tokens[i++];
  }

  if (next === "shipping" || next === "billing") {
    next = tokens[i++];
  }

  let field: string | null = null;

  switch (next) {
    case "name":
    case "honorific-prefix":
    case "given-name":
    case "additional-name":
    case "family-name":
    case "honorific-suffix":
    case "nickname":
    case "username":
    case "new-password":
    case "current-password":
    case "organization-title":
    case "organization":
    case "street-address":
    case "address-line1":
    case "address-line2":
    case "address-line3":
    case "address-level4":
    case "address-level3":
    case "address-level2":
    case "address-level1":
    case "country":
    case "country-name":
    case "postal-code":
    case "cc-name":
    case "cc-given-name":
    case "cc-additional-name":
    case "cc-family-name":
    case "cc-number":
    case "cc-exp":
    case "cc-exp-month":
    case "cc-exp-year":
    case "cc-csc":
    case "cc-type":
    case "transaction-currency":
    case "transaction-amount":
    case "language":
    case "bday":
    case "bday-day":
    case "bday-month":
    case "bday-year":
    case "sex":
    case "url":
    case "photo":
      field = next;
      next = tokens[i++];
      break;

    default:
      switch (next) {
        case "home":
        case "work":
        case "mobile":
        case "fax":
        case "pager":
          next = tokens[i++];
      }

      switch (next) {
        case "tel":
        case "tel-country-code":
        case "tel-national":
        case "tel-area-code":
        case "tel-local":
        case "tel-local-prefix":
        case "tel-local-suffix":
        case "tel-extension":
        case "email":
        case "impp":
          field = next;
          next = tokens[i++];
      }
  }

  if (field === null) {
    return false;
  }

  return autocomplete.owner.some(isAppropriateField(field));
};

function isAppropriateField(field: string): Predicate<Element> {
  return (element) => {
    if (element.name === "textarea" || element.name === "select") {
      return true;
    }

    const type = element
      .attribute("type")
      .map((attr) => attr.value.toLowerCase())
      .getOr("text");

    // If "street-address" is specified on an <input> element, it must be
    // hidden.
    if (field === "street-address") {
      return type === "hidden";
    }

    // The remaining fields are always appropriate for these <input> types.
    switch (type) {
      case "hidden":
      case "text":
      case "search":
        return true;
    }

    // Non-text fields may also have additional <input> types.
    switch (field) {
      case "new-password":
      case "current-password":
        return type === "password";

      case "cc-exp":
        return type === "month";

      case "cc-exp-month":
      case "cc-exp-year":
      case "transaction-amount":
      case "bday-day":
      case "bday-month":
      case "bday-year":
        return type === "number";

      case "bday":
        return type === "date";

      case "url":
      case "photo":
      case "impp":
        return type === "url";

      case "tel":
        return type === "tel";

      case "email":
        return type === "email";
    }

    return false;
  };
}

export namespace Outcomes {
  export const HasValidValue = Ok.of(
    Diagnostic.of(`The \`autocomplete\` attribute has a valid value`)
  );

  export const HasNoValidValue = Err.of(
    Diagnostic.of(`The \`autocomplete\` attribute does not have a valid value`)
  );
}
