import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM, Node } from "@siteimprove/alfa-aria";
import { Array } from "@siteimprove/alfa-array";
import type { Attribute} from "@siteimprove/alfa-dom";
import { Element, Namespace, Query } from "@siteimprove/alfa-dom";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";
import { String } from "@siteimprove/alfa-string";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import * as dom from "@siteimprove/alfa-dom";

import { expectation } from "../common/act/expectation.js";

import { Scope, Stability } from "../tags/index.js";

const { hasRole, isPerceivableForAll } = DOM;
const { hasAttribute, hasInputType, hasName, hasNamespace } = Element;
const { and, or, not } = Predicate;
const { isTabbable } = Style;
const { either, end, option, right, parseIf } = Parser;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://alfa.siteimprove.com/rules/sia-r10",
  requirements: [Criterion.of("1.3.5")],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document }) {
    return {
      applicability() {
        return (
          getElementDescendants(document, dom.Node.fullTree)
            .filter(
              and(
                hasNamespace(Namespace.HTML),
                hasName("input", "select", "textarea"),
                not(hasInputType("hidden", "button", "submit", "reset")),
                hasAttribute("autocomplete", hasTokens),
                hasAttribute(
                  "autocomplete",
                  (autocomplete) =>
                    String.normalize(autocomplete) !== "on" &&
                    String.normalize(autocomplete) !== "off",
                ),
                or(
                  isTabbable(device),
                  hasRole(device, (role) => role.isWidget()),
                ),
                isPerceivableForAll(device),
                (element) =>
                  Node.from(element, device)
                    .attribute("aria-disabled")
                    .none((disabled) => disabled.value === "true"),
              ),
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
            () => Outcomes.HasNoValidValue,
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
 * {@link https://html.spec.whatwg.org/multipage/#autofill-detail-tokens}
 */
const isValidAutocomplete: Predicate<Attribute> = (autocomplete) => {
  const tokens = autocomplete.value.toLowerCase().trim().split(/\s+/);

  // The following line comments each refers to the corresponding position in the HTML specification linked above at the time of writing
  const parse = right(
    option(section), // 1.
    right(
      option(addressType), // 2.
      right(
        // 3.
        either(
          unmodifiable, // 3.a
          right(option(modifier) /*3.b.1*/, modifiable /*3.b.2*/),
        ),
        right(
          option(webauthn), // 4.
          end((token) => `Expected EOF, but got ${token}`),
        ),
      ),
    ),
  );

  return parse(Slice.of(tokens)).isOk();
};

const unmodifiables = Array.from([
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
  "one-time-code",
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

const modifiables = Array.from([
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

const modifiers = Array.from(["home", "work", "mobile", "fax", "pager"]);

const parseFirst: Parser<Slice<string>, string, string> = (
  input: Slice<string>,
) =>
  input
    .first()
    .map((token) => Ok.of<[Slice<string>, string]>([input.rest(), token]))
    .getOr(Err.of("No token left"));

function parserOf(
  tokens: Array<string>,
): Parser<Slice<string>, string, string> {
  return parseIf(
    (token): token is string => tokens.includes(token),
    parseFirst,
    (token) => `Expected valid token, but got ${token}`,
  );
}

const addressType = parserOf(["shipping", "billing"]);
const unmodifiable = parserOf(unmodifiables);
const section: Parser<Slice<string>, string, string> = parseIf(
  (token): token is string => token.startsWith("section-"),
  parseFirst,
  (token) => `Expected token beginning with \`section-\`, but got ${token}`,
);
const modifiable = parserOf(modifiables);
const modifier = parserOf(modifiers);
const webauthn = parserOf(["webauthn"]);

/**
 * @public
 */
export namespace Outcomes {
  export const HasValidValue = Ok.of(
    Diagnostic.of(`The \`autocomplete\` attribute has a valid value`),
  );
  export const HasNoValidValue = Err.of(
    Diagnostic.of(`The \`autocomplete\` attribute does not have a valid value`),
  );
}
