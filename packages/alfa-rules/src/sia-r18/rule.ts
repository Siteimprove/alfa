import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM, Role } from "@siteimprove/alfa-aria";
import type { Attribute } from "@siteimprove/alfa-dom";
import { Element, Node, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Selective } from "@siteimprove/alfa-selective";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Set } from "@siteimprove/alfa-set";
import { Technique } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import * as aria from "@siteimprove/alfa-aria";

import { expectation } from "../common/act/index.js";
import { ARIA } from "../requirements/index.js";

import { Scope, Stability, Version } from "../tags/index.js";

const { hasRole, isIncludedInTheAccessibilityTree } = DOM;
const { hasDisplaySize, hasInputType, hasName } = Element;
const { test, property } = Predicate;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://alfa.siteimprove.com/rules/sia-r18",
  requirements: [
    ARIA.of("https://www.w3.org/TR/wai-aria-1.2/#state_property_processing"),
    Technique.of("ARIA5"),
  ],
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
      // https://www.w3.org/TR/html-aria/#el-input-color
      case "color":
        return attributeName === "aria-disabled";
      // https://www.w3.org/TR/html-aria/#el-input-date
      case "date":
      // https://www.w3.org/TR/html-aria/#el-input-datetime-local
      case "datetime-local":
      // https://www.w3.org/TR/html-aria/#el-input-email
      case "email":
      // https://www.w3.org/TR/html-aria/#el-input-month
      case "month":
      // https://www.w3.org/TR/html-aria/#el-input-password
      case "password":
      // https://www.w3.org/TR/html-aria/#el-input-time
      case "time":
      // https://www.w3.org/TR/html-aria/#el-input-week
      case "week":
        return Role.of("textbox").isAttributeSupported(attributeName);
      // https://www.w3.org/TR/html-aria/#el-input-file
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
  return target.owner
    .map((element) =>
      Selective.of(element)
        .if(hasName("input"), allowedForInputType(attributeName))
        // https://www.w3.org/TR/html-aria/#el-select
        .if(
          hasName("select"),
          (select) =>
            (hasDisplaySize((size: Number) => size !== 1)(select) &&
              Role.of("combobox").isAttributeSupported(attributeName)) ||
            Role.of("menu").isAttributeSupported(attributeName),
        )
        .else(() => false)
        .get(),
    )
    .getOr(false);
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
