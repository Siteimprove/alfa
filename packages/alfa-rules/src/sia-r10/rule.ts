import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM, Node } from "@siteimprove/alfa-aria";
import { Array } from "@siteimprove/alfa-array";
import { Attribute, Element, Namespace } from "@siteimprove/alfa-dom";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import * as dom from "@siteimprove/alfa-dom";

import { expectation } from "../common/act/expectation";
import { normalize } from "../common/normalize";

import { Scope } from "../tags";

const { hasRole, isPerceivableForAll } = DOM;
const { hasAttribute, hasInputType, hasName, hasNamespace } = Element;
const { and, or, not } = Predicate;
const { isTabbable } = Style;
const { either, end, option, right } = Parser;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://alfa.siteimprove.com/rules/sia-r10",
  requirements: [Criterion.of("1.3.5")],
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return (
          document
            .elementDescendants(dom.Node.fullTree)
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
          right(option(modifier) /*3.b.1*/, modifiable /*3.b.2*/)
        ),
        right(
          option(webauthn), // 4.
          end((token) => `Expected EOF, but got ${token}`)
        )
      )
    )
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

const addressType = parserOf(["shipping", "billing"]);
const section = sectionParser();
const unmodifiable = parserOf(unmodifiables);
const modifiable = parserOf(modifiables);
const modifier = parserOf(modifiers);
const webauthn = parserOf(["webauthn"]);

function parserOf(
  tokens: Array<string>
): Parser<Slice<string>, string, string> {
  return (input) => {
    const token = input.array[input.offset];

    if (token !== undefined && tokens.includes(token)) {
      return Result.of([input.slice(1), token]);
    }

    return Err.of(`Expected valid token, but got ${input.toJSON()}`);
  };
}

function sectionParser(): Parser<Slice<string>, string, string> {
  return (input) => {
    const token = input.array[input.offset];

    if (token !== undefined && token.startsWith("section-")) {
      return Result.of([input.slice(1), token]);
    }

    return Err.of(
      `Expected token beginning with \`section-\`, but got ${input}`
    );
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
