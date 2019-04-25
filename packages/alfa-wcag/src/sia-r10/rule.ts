import { Atomic } from "@siteimprove/alfa-act";
import {
  Category,
  getRole,
  isExposed,
  isVisible
} from "@siteimprove/alfa-aria";
import { Seq } from "@siteimprove/alfa-collection";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Attribute,
  Document,
  Element,
  getAttribute,
  getAttributeNode,
  getElementNamespace,
  getInputType,
  getOwnerElement,
  getTabIndex,
  hasAttribute,
  InputType,
  isElement,
  Namespace,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { Stream } from "@siteimprove/alfa-lang";

const {
  map,
  Iterable: { filter }
} = BrowserSpecific;

export const SIA_R10: Atomic.Rule<Device | Document, Attribute> = {
  id: "sanshikan:rules/sia-r10.html",
  requirements: [{ id: "wcag:identify-input-purpose", partial: true }],
  evaluate: ({ device, document }) => {
    return {
      applicability: () => {
        return map(
          filter(
            querySelectorAll<Element>(
              document,
              document,
              node => {
                return (
                  isElement(node) &&
                  hasAutocomplete(node) &&
                  isVisible(node, document, device)
                );
              },
              {
                flattened: true
              }
            ),
            element => {
              return map(isExposed(element, document, device), isExposed => {
                if (!isExposed) {
                  return false;
                }

                return isAutocompletable(element, document, device);
              });
            }
          ),
          elements => {
            return Seq(elements).map(element => {
              return {
                applicable: true,
                aspect: document,
                target: getAttributeNode(element, "autocomplete")!
              };
            });
          }
        );
      },

      expectations: (aspect, target) => {
        return {
          1: { holds: isValidAutocomplete(target, document) }
        };
      }
    };
  }
};

function isAutocompletable(
  element: Element,
  context: Node,
  device: Device
): boolean | BrowserSpecific<boolean> {
  if (getElementNamespace(element, context) !== Namespace.HTML) {
    return false;
  }

  switch (element.localName) {
    case "select":
    case "textarea":
      break;
    case "input":
      switch (getInputType(element)) {
        case InputType.Hidden:
        case InputType.Button:
        case InputType.Submit:
        case InputType.Reset:
          return false;
      }
      break;
    default:
      return false;
  }

  if (hasAttribute(element, "disabled")) {
    return false;
  }

  if (
    getAttribute(element, "aria-disabled", { trim: true, lowerCase: true }) ===
    "true"
  ) {
    return false;
  }

  const tabIndex = getTabIndex(element, context);

  if (tabIndex === null || tabIndex >= 0) {
    return true;
  }

  return map(getRole(element, context, device), role => {
    if (role === null) {
      return false;
    }

    const { category } = role;

    return typeof category === "function"
      ? category(element, context, device) === Category.Widget
      : category === Category.Widget;
  });
}

function hasAutocomplete(element: Element): boolean {
  return (
    hasAttribute(element, "autocomplete") &&
    getAttribute(element, "autocomplete") !== ""
  );
}

function isValidAutocomplete(autocomplete: Attribute, context: Node): boolean {
  const tokens = autocomplete.value
    .toLowerCase()
    .trim()
    .split(/\s+/);

  const stream = new Stream(tokens.length, i => tokens[i]);

  let next = stream.next();

  if (next === null) {
    return false;
  }

  if (next === "on" || next === "off") {
    return stream.done();
  }

  if (next.startsWith("section-")) {
    next = stream.next();
  }

  if (next === "shipping" || next === "billing") {
    next = stream.next();
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
      next = stream.next();
      break;

    default:
      switch (next) {
        case "home":
        case "work":
        case "mobile":
        case "fax":
        case "pager":
          next = stream.next();
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
          next = stream.next();
      }
  }

  if (field === null) {
    return false;
  }

  const ownerElement = getOwnerElement(autocomplete, context);

  if (ownerElement === null) {
    return false;
  }

  return isAppropriateField(field, ownerElement);
}

function isAppropriateField(field: string, element: Element): boolean {
  if (element.localName === "textarea" || element.localName === "select") {
    return true;
  }

  const type = getInputType(element);

  if (type === null) {
    return false;
  }

  // If "street-address" is specified on an <input> element, it must be hidden.
  if (field === "street-address") {
    return type === InputType.Hidden;
  }

  // The remaining fields are always appropriate for these <input> types.
  switch (type) {
    case InputType.Hidden:
    case InputType.Text:
    case InputType.Search:
      return true;
  }

  // Non-text fields may also have additional <input> types.
  switch (field) {
    case "new-password":
    case "current-password":
      return type === InputType.Password;

    case "cc-exp":
      return type === InputType.Month;

    case "cc-exp-month":
    case "cc-exp-year":
    case "transaction-amount":
    case "bday-day":
    case "bday-month":
    case "bday-year":
      return type === InputType.Number;

    case "bday":
      return type === InputType.Date;

    case "url":
    case "photo":
    case "impp":
      return type === InputType.Url;

    case "tel":
      return type === InputType.Tel;

    case "email":
      return type === InputType.Email;
  }

  return false;
}
