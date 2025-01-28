import { Predicate } from "@siteimprove/alfa-predicate";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";
import { Array } from "@siteimprove/alfa-array";
import { Err, Ok } from "@siteimprove/alfa-result";

const { either, end, option, right, parseIf } = Parser;

/**
 * @public
 */
export namespace Autocomplete {

  /**
   * Autofill detail tokens from steps 2-4 of the list in {@link https://html.spec.whatwg.org/multipage/#autofill-detail-tokens}.
   */
  export namespace AutofillDetailTokens {
    export const unmodifiables = [
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
    ];

    export const modifiables = [
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
    ];

    export const modifiers = ["home", "work", "mobile", "fax", "pager"];
    export const addressTypes = ["shipping", "billing"];
    export const webauthn = "webauthn";
  }

  /**
   * Checks if the provided string contains a valid autocomplete string according to {@link https://html.spec.whatwg.org/multipage/#autofill-detail-tokens}
   */
  export const isValid: Predicate<string> = (autocomplete) => {
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

    return parse(Slice.of(tokenize(autocomplete))).isOk();
  }

  export function tokenize(autocomplete: string): Array<string> {
    return Array.from(autocomplete.toLowerCase().trim().split(/\s+/));
  }

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

  const addressType = parserOf(AutofillDetailTokens.addressTypes);
  const unmodifiable = parserOf(AutofillDetailTokens.unmodifiables);
  const section: Parser<Slice<string>, string, string> = parseIf(
    (token): token is string => token.startsWith("section-"),
    parseFirst,
    (token) => `Expected token beginning with \`section-\`, but got ${token}`,
  );
  const modifiable = parserOf(AutofillDetailTokens.modifiables);
  const modifier = parserOf(AutofillDetailTokens.modifiers);
  const webauthn = parserOf([AutofillDetailTokens.webauthn]);
}
