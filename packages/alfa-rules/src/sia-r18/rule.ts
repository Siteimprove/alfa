import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import type { Attribute } from "@siteimprove/alfa-dom";
import { Node, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Technique } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import * as aria from "@siteimprove/alfa-aria";

import { expectation } from "../common/act/index.js";
import { ARIA } from "../requirements/index.js";

import { Scope, Stability, Version } from "../tags/index.js";

const { hasRole, isIncludedInTheAccessibilityTree } = DOM;
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
        // Since the attribute was found on a element, it has an owner.
        const owner = target.owner.getUnsafe();
        const ariaNode = aria.Node.from(owner, device) as aria.Element;

        return {
          1: expectation(
            ariaNode.isAttributeAllowed(target.name as aria.Attribute.Name),
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
