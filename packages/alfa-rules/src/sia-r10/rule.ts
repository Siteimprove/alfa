import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM, Node } from "@siteimprove/alfa-aria";
import { Attribute, Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import * as dom from "@siteimprove/alfa-dom";

import { expectation } from "../common/act/expectation";
import { normalize } from "../common/normalize";

import { Array } from "@siteimprove/alfa-array";
import { Scope } from "../tags";

const { hasRole, isPerceivableForAll } = DOM;
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
        return (
          document
            .descendants(dom.Node.fullTree)
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
                isPerceivableForAll(device),
                (element) =>
                  Node.from(element, device)
                    .attribute("aria-disabled")
                    .none((disabled) => disabled.value === "true")
              )
            )
            // The big second filter ensure that autocomplete exists
            .map((element) => element.attribute("autocomplete").getUnsafe())
        );
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

/**
 * {@link https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill-detail-tokens}
 */ 
const isValidAutocomplete: Predicate<Attribute> = (autocomplete) => {
  const tokens = autocomplete.value.toLowerCase().trim().split(/\s+/);

  let i = 0;
  let next: string | undefined = tokens[i++];

  if (next === undefined) {
    return false;
  }

  // 1. Optional
  if (next.startsWith("section-")) {
    next = tokens[i++];
  }

  // 2. Optional
  if (next === "shipping" || next === "billing") {
    next = tokens[i++];
  }
  
  if (next === undefined) {
    return true;
  }

  // 3. Either of the following two options:
  if (unmodifiableFields.includes(next)) {
    next = tokens[i++];
  } else if (modifiers.includes(next)) {
    next = tokens[i++];
    // Optional, but must be followed by:
    if (modifiableFields.includes(next)) {
      next = tokens[i++];
    } else {
      return false;
    }
  }

  // 4. Optional
  if (next === "webauthn") {
    next = tokens[i++];
  }
  
  // Any additional tokens will be invalid
  return next === undefined;
};

const unmodifiableFields = Array.from([
  "name",
  "honorific-prefix",
  "given-name",
  "additional-name",
  "family-name",
  "honorific-suffix",
  "nickname",
  "username",
  "new-password",
  "current-password",
  "organization-title",
  "organization",
  "street-address",
  "address-line1",
  "address-line2",
  "address-line3",
  "address-level4",
  "address-level3",
  "address-level2",
  "address-level1",
  "country",
  "country-name",
  "postal-code",
  "cc-name",
  "cc-given-name",
  "cc-additional-name",
  "cc-family-name",
  "cc-number",
  "cc-exp",
  "cc-exp-month",
  "cc-exp-year",
  "cc-csc",
  "cc-type",
  "transaction-currency",
  "transaction-amount",
  "language",
  "bday",
  "bday-day",
  "bday-month",
  "bday-year",
  "sex",
  "url",
  "photo",
]);

const modifiers = Array.from(["home", "work", "mobile", "fax", "pager"]);

const modifiableFields = Array.from([
  "tel",
  "tel-country-code",
  "tel-national",
  "tel-area-code",
  "tel-local",
  "tel-local-prefix",
  "tel-local-suffix",
  "tel-extension",
  "email",
  "impp",
]);

export namespace Outcomes {
  export const HasValidValue = Ok.of(
    Diagnostic.of(`The \`autocomplete\` attribute has a valid value`)
  );

  export const HasNoValidValue = Err.of(
    Diagnostic.of(`The \`autocomplete\` attribute does not have a valid value`)
  );
}
