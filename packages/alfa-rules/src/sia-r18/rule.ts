import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Role } from "@siteimprove/alfa-aria";
import { Attribute, Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Set } from "@siteimprove/alfa-set";
import { Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import * as aria from "@siteimprove/alfa-aria";

import { expectation } from "../common/act/expectation";

import {
  hasRole,
  isIgnored,
  hasDisplaySize,
  hasAttribute,
} from "../common/predicate";
import { Scope } from "../tags";

const { test, property, and, not } = Predicate;
const { isElement, hasInputType } = Element;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://alfa.siteimprove.com/rules/sia-r18",
  requirements: [Technique.of("ARIA5")],
  tags: [Scope.Component],
  evaluate({ device, document }) {
    const global = Set.from(Role.of("roletype").attributes);

    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(isElement)
          .reject(isIgnored(device))
          .flatMap((element) =>
            Sequence.from(element.attributes).filter(
              property("name", aria.Attribute.isName)
            )
          );
      },

      expectations(target) {
        return {
          1: expectation(
            global.has(target.name as aria.Attribute.Name) ||
              test(
                hasRole(device, (role) =>
                  role.isAttributeSupported(target.name as aria.Attribute.Name)
                ),
                target.owner.get()
              ) ||
              ariaHtmlAllowed(target),
            () => Outcomes.IsAllowed,
            () => Outcomes.IsNotAllowed
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
            "week"
          )(element) && Role.of("textbox").isAttributeSupported(attributeName)
        );

      case "select":
        return (
          (hasDisplaySize((size: Number) => size !== 1) &&
            Role.of("combobox").isAttributeSupported(attributeName)) ||
          Role.of("menu").isAttributeSupported(attributeName)
        );

      case "video":
        return Role.of("application").isAttributeSupported(attributeName);
    }
  }
  return false;
}

export namespace Outcomes {
  export const IsAllowed = Ok.of(
    Diagnostic.of(
      `The attribute is allowed for the element on which it is specified`
    )
  );

  export const IsNotAllowed = Err.of(
    Diagnostic.of(
      `The attribute is not allowed for the element on which it is specified`
    )
  );
}
