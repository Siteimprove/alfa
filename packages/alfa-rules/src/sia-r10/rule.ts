import { Rule } from "@siteimprove/alfa-act";
import { Role } from "@siteimprove/alfa-aria";
import {
  Attribute,
  Element,
  getAttributeNode,
  getInputType,
  getOwnerElement,
  InputType,
  isElement,
  Namespace,
  Node
} from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasAttribute } from "../common/predicate/has-attribute";
import { hasInputType } from "../common/predicate/has-input-type";
import { hasName } from "../common/predicate/has-name";
import { hasNamespace } from "../common/predicate/has-namespace";
import { hasRole } from "../common/predicate/has-role";
import { hasTabIndex } from "../common/predicate/has-tab-index";
import { isEmpty } from "../common/predicate/is-empty";
import { isIgnored } from "../common/predicate/is-ignored";
import { isVisible } from "../common/predicate/is-visible";

import { walk } from "../common/walk";

const { filter, map } = Iterable;
const { and, or, not, equals, test } = Predicate;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r10.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return map(
          filter(
            walk(document, document, { flattened: true, nested: true }),
            and(
              isElement,
              and(
                hasAttribute(document, "autocomplete", not(isEmpty)),
                and(
                  hasNamespace(document, equals(Namespace.HTML)),
                  and(
                    hasName(equals("input", "select", "textarea")),
                    and(
                      or(
                        isVisible(document, device),
                        not(isIgnored(document, device))
                      ),
                      and(
                        not(
                          and(
                            hasName(equals("input")),
                            hasInputType(
                              document,
                              equals(
                                InputType.Hidden,
                                InputType.Button,
                                InputType.Submit,
                                InputType.Reset
                              )
                            )
                          )
                        ),
                        and(
                          not(hasAttribute(document, "disabled")),
                          and(
                            not(
                              hasAttribute(
                                document,
                                "aria-disabled",
                                equals("true")
                              )
                            ),
                            or(
                              hasTabIndex(document, tabIndex => tabIndex >= 0),
                              hasRole(
                                document,
                                role => role.category === Role.Category.Widget
                              )
                            )
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          ),
          element => getAttributeNode(element, document, "autocomplete").get()
        );
      },

      expectations(target) {
        return {
          1: test(isValidAutocomplete(document), target)
            ? Ok.of("The autocomplete attribute has a valid value")
            : Err.of("The autocomplete attribute does not have a valid value")
        };
      }
    };
  }
});

function isValidAutocomplete(context: Node): Predicate<Attribute> {
  return autocomplete => {
    const tokens = autocomplete.value
      .toLowerCase()
      .trim()
      .split(/\s+/);

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

    return getOwnerElement(autocomplete, context)
      .filter(isAppropriateField(context, field))
      .isSome();
  };
}

function isAppropriateField(context: Node, field: string): Predicate<Element> {
  return element => {
    if (element.localName === "textarea" || element.localName === "select") {
      return true;
    }

    return getInputType(element, context)
      .map(inputType => {
        // If "street-address" is specified on an <input> element, it must be
        // hidden.
        if (field === "street-address") {
          return inputType === InputType.Hidden;
        }

        // The remaining fields are always appropriate for these <input> types.
        switch (inputType) {
          case InputType.Hidden:
          case InputType.Text:
          case InputType.Search:
            return true;
        }

        // Non-text fields may also have additional <input> types.
        switch (field) {
          case "new-password":
          case "current-password":
            return inputType === InputType.Password;

          case "cc-exp":
            return inputType === InputType.Month;

          case "cc-exp-month":
          case "cc-exp-year":
          case "transaction-amount":
          case "bday-day":
          case "bday-month":
          case "bday-year":
            return inputType === InputType.Number;

          case "bday":
            return inputType === InputType.Date;

          case "url":
          case "photo":
          case "impp":
            return inputType === InputType.Url;

          case "tel":
            return inputType === InputType.Tel;

          case "email":
            return inputType === InputType.Email;
        }

        return false;
      })
      .getOr(false);
  };
}
