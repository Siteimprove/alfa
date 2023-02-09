import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM, Node } from "@siteimprove/alfa-aria";
import { Attribute, Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";
import { None, Option, Some } from "@siteimprove/alfa-option";

import * as dom from "@siteimprove/alfa-dom";

import { expectation } from "../common/act/expectation";
import { normalize } from "../common/normalize";

import { Array } from "@siteimprove/alfa-array";
import { Scope } from "../tags";
import { Sequence } from "@siteimprove/alfa-sequence";

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
  const tokens = autocomplete.value.toLowerCase();

  const reader = Reader.of(tokens);
  const lexer = Lexer.of(reader);
  const parser = Parser.of(lexer);

  return parser.parse().isOk();
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

class Reader {
  private constructor(private input: string) {}

  static of(input: string) {
    return new Reader(input);
  }

  private cursor = 0;

  peek(k: number = 0): Option<string> {
    const char = this.input.charAt(this.cursor + k);
    return char === "" ? None : Some.of(char);
  }

  consume() {
    return this.peek().tee(() => {
      this.cursor += 1;
    });
  }
}

class Lexer {
  private readonly tokens: string[] = [];
  private constructor(private reader: Reader) {
    while (true) {
      let next = reader.peek();
      if (!next.isSome()) {
        return;
      }
      if (next.get() === " ") {
        reader.consume(); // Consume and discard whitespace
      } else {
        this.token();
      }
    }
  }

  static of(reader: Reader) {
    return new Lexer(reader);
  }

  private cursor = 0;

  peek() {
    return Option.from(this.tokens[this.cursor]);
  }

  consume() {
    return this.peek().tee(() => {
      this.cursor += 1;
    });
  }

  private token() {
    let chars: string[] = [];
    while (true) {
      const next = this.reader.consume();
      if (!next.isSome()) {
        break;
      }
      if (next.get() === " ") {
        break;
      }
      chars.push(next.get());
    }
    this.tokens.push(chars.join(""));
  }
}

class Parser {
  private constructor(private lexer: Lexer) {
    this.token = lexer.consume();
  }

  static of(lexer: Lexer) {
    return new Parser(lexer);
  }

  private token: Option<string>;
  private nextToken() {
    this.token = this.lexer.consume();
  }

  accept(token: Option<string>) {
    if (this.token.equals(token)) {
      this.nextToken();
      return true;
    }
    return false;
  }

  expect(token: Option<string>): Result<None, string> {
    if (this.accept(token)) {
      return Ok.of(None);
    }

    return Err.of(`unexpected token: \`${token}\``);
  }

  section() {
    if (this.token.isSome() && this.token.get().startsWith("section-")) {
      this.nextToken();
    }
    return Ok.of(None);
  }

  shippingOrBilling() {
    this.accept(Some.of("shipping")) || this.accept(Some.of("billing"));
    return Ok.of(None);
  }

  // TODO: Come up with a better name
  required(): Result<None, string> {
    if (!this.token.isSome()) {
      return Err.of("expected some token");
    }

    if (
      unmodifiableFields.includes(this.token.get()) ||
      modifiableFields.includes(this.token.get())
    ) {
      this.nextToken();
      return Ok.of(None);
    } else if (modifiers.includes(this.token.get())) {
      this.nextToken();
      if (this.token.isSome() && modifiableFields.includes(this.token.get())) {
        this.nextToken();
        return Ok.of(None);
      }

      return Err.of("expected modifiable");
    }

    return Err.of("missing required token");
  }

  webauthn() {
    this.accept(Some.of("webauthn"));
    return Ok.of(None);
  }

  parse() {
    return this.section().and(
      this.shippingOrBilling().and(
        this.required().and(this.webauthn().and(this.expect(None)))
      )
    );
  }
}
