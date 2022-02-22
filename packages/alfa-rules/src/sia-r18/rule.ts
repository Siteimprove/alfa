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

import { hasRole, isIgnored } from "../common/predicate";
import { Scope } from "../tags";

const { test, property } = Predicate;
const { isElement } = Element;

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
              ),
            () => Outcomes.IsAllowed,
            () => Outcomes.IsNotAllowed
          ),
        };
      },
    };
  },
});

function ariaHtmlAllowed(element: Element, role: Role): boolean {
  switch (element.name) {
    case "body":
      if (
        element.parent.name === "body" &&
        Role.of("document").isAttributeSupported(
          element.name as aria.Attribute.Name
        )
      ) {
        return true;
      }
    case "video":
      if (
        element.parent.name === "video" &&
        Role.of("application").isAttributeSupported(
          element.name as aria.Attribute.Name
        )
      ) {
        return true;
      }
  }
  {
    return false;
  }
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
