import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM, Role } from "@siteimprove/alfa-aria";
import { Attribute, Element, Node, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Set } from "@siteimprove/alfa-set";
import { Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import * as aria from "@siteimprove/alfa-aria";

import { expectation } from "../common/act/expectation.js";

import { Scope, Stability, Version } from "../tags/index.js";

const { hasRole, isIncludedInTheAccessibilityTree } = DOM;
const { hasDisplaySize, hasInputType } = Element;
const { test, property } = Predicate;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://alfa.siteimprove.com/rules/sia-r18",
  requirements: [Technique.of("ARIA5")],
  tags: [Scope.Component, Stability.Stable, Version.of(2)],
  evaluate({ device, document }) {
    const global = Set.from(Role.of("roletype").supportedAttributes);

    return {
      applicability() {
        return getElementDescendants(document, Node.fullTree)
          .filter(isIncludedInTheAccessibilityTree(device))
          .flatMap((element) =>
            Sequence.from(element.attributes).filter(
              property("name", aria.Attribute.isName),
            ),
          );
      },

      expectations(target) {
        // Since the attribute was found on a element, it has a owner.
        const owner = target.owner.getUnsafe();

        return {
          1: expectation(
            global.has(target.name as aria.Attribute.Name) ||
              test(
                hasRole(device, (role) =>
                  role.isAttributeSupported(target.name as aria.Attribute.Name),
                ),
                owner,
              ) ||
              ariaHtmlAllowed(target),
            () => Outcomes.IsAllowed,
            () => Outcomes.IsNotAllowed,
          ),
          2: expectation(
            test(
              hasRole(device, (role) =>
                role.isAttributeProhibited(target.name as aria.Attribute.Name),
              ),
              owner,
            ),
            () => Outcomes.IsProhibited,
            () => Outcomes.IsNotProhibited,
          ),
        };
      },
    };
  },
});

function allowedForInputType(
  attributeName: aria.Attribute.Name,
): Predicate<Element> {
  return hasInputType((inputType) => {
    switch (inputType) {
      case "color":
        return attributeName === "aria-disabled";
      case "date":
      case "datetime-local":
      case "email":
      case "month":
      case "password":
      case "time":
      case "week":
        return Role.of("textbox").isAttributeSupported(attributeName);
      case "file":
        return (
          attributeName === "aria-disabled" ||
          attributeName === "aria-invalid" ||
          attributeName === "aria-required"
        );
      default:
        return false;
    }
  });
}

function ariaHtmlAllowed(target: Attribute): boolean {
  const attributeName = target.name as aria.Attribute.Name;
  for (const element of target.owner) {
    switch (element.name) {
      case "body":
        return Role.of("document").isAttributeSupported(attributeName);

      case "input":
        return allowedForInputType(attributeName)(element);

      case "select":
        return (
          (hasDisplaySize((size: Number) => size !== 1)(element) &&
            Role.of("combobox").isAttributeSupported(attributeName)) ||
          Role.of("menu").isAttributeSupported(attributeName)
        );

      case "video":
        return Role.of("application").isAttributeSupported(attributeName);
    }
  }
  return false;
}

/**
 * @public
 */
export namespace Outcomes {
  export const IsAllowed = Ok.of(
    Diagnostic.of(
      `The attribute is allowed for the element on which it is specified`,
    ),
  );

  export const IsNotAllowed = Err.of(
    Diagnostic.of(
      `The attribute is not allowed for the element on which it is specified`,
    ),
  );

  export const IsProhibited = Err.of(
    Diagnostic.of(
      `The attribute is prohibited for the element on which it is specified`,
    ),
  );

  export const IsNotProhibited = Ok.of(
    Diagnostic.of(
      `The attribute is not prohibited for the element on which it is specified`,
    ),
  );
}
