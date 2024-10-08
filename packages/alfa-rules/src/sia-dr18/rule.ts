import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM, Role } from "@siteimprove/alfa-aria";
import type { Attribute } from "@siteimprove/alfa-dom";
import { Element, Node, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Set } from "@siteimprove/alfa-set";
import { Technique } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import * as aria from "@siteimprove/alfa-aria";

import { expectation } from "../common/act/expectation.js";

import { Scope, Stability } from "../tags/index.js";

const { hasRole, isIncludedInTheAccessibilityTree } = DOM;
const { hasDisplaySize, hasInputType } = Element;
const { test, property } = Predicate;
const { getElementDescendants } = Query;

/**
 * @deprecated Use SIA-R18 version 2 instead
 */
export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://alfa.siteimprove.com/rules/sia-r18",
  requirements: [Technique.of("ARIA5")],
  tags: [Scope.Component, Stability.Deprecated],
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
        return {
          1: expectation(
            global.has(target.name as aria.Attribute.Name) ||
              test(
                hasRole(device, (role) =>
                  role.isAttributeSupported(target.name as aria.Attribute.Name),
                ),
                // Since the attribute was found on a element, it has a owner.
                target.owner.getUnsafe(),
              ) ||
              ariaHtmlAllowed(target),
            () => Outcomes.IsAllowed,
            () => Outcomes.IsNotAllowed,
          ),
        };
      },
    };
  },
});

function ariaHtmlAllowed(target: Attribute): boolean {
  const attributeName = target.name as aria.Attribute.Name;
  for (const element of target.owner) {
    switch (element.name) {
      case "body":
        return Role.of("document").isAttributeSupported(attributeName);

      case "input":
        return (
          hasInputType(
            "date",
            "datetime-local",
            "email",
            "month",
            "password",
            "time",
            "week",
          )(element) && Role.of("textbox").isAttributeSupported(attributeName)
        );

      case "select":
        return (
          (hasDisplaySize((size: Number) => size !== 1)(
            element as Element<"select">,
          ) &&
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
}
