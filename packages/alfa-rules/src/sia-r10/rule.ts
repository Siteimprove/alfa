import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { DOM, Node } from "@siteimprove/alfa-aria";
import { Attribute, Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";
import { normalize } from "../common/normalize";

import { Scope } from "../tags";

const { hasRole, isPerceivable } = DOM;
const { hasAttribute, hasInputType, hasName, hasNamespace, isElement } =
  Element;
const { and, or, not } = Predicate;
const { isTabbable } = Style;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://alfa.siteimprove.com/rules/sia-r10",
  requirements: [Criterion.of("1.3.5")],
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(isElement)
          .filter(
            and(
              hasNamespace(Namespace.HTML),
              hasName("input", "select", "textarea"),
              not(hasInputType("hidden", "button", "submit", "reset")),
              hasAttribute("autocomplete", hasTokens),
              hasAttribute(
                "autocomplete",
                (autocomplete) =>
                  normalize(autocomplete) !== "on" &&
                  normalize(autocomplete) !== "off"
              ),
              or(
                isTabbable(device),
                hasRole(device, (role) => role.isWidget())
              ),
              isPerceivable(device),
              (element) =>
                Node.from(element, device)
                  .attribute("aria-disabled")
                  .none((disabled) => disabled.value === "true")
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
      }
  }

  if (field === null) {
    return false;
  }

  return true;
};

export namespace Outcomes {
  export const HasValidValue = Ok.of(
    Diagnostic.of(`The \`autocomplete\` attribute has a valid value`)
  );

  export const HasNoValidValue = Err.of(
    Diagnostic.of(`The \`autocomplete\` attribute does not have a valid value`)
  );
}
