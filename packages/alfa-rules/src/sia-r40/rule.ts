import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import type { Element } from "@siteimprove/alfa-dom";
import { Node, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/index.js";
import { ARIA } from "../requirements/index.js";

import { Scope, Stability } from "../tags/index.js";

const {
  hasIncorrectRoleWithoutName,
  hasNonEmptyAccessibleName,
  hasRole,
  isIncludedInTheAccessibilityTree,
} = DOM;
const { and } = Predicate;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r40",
  requirements: [
    ARIA.of("https://www.w3.org/TR/wai-aria/#region"),
    ARIA.of(
      "https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/#aria_lh_region",
    ),
  ],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document }) {
    return {
      applicability() {
        return (
          getElementDescendants(document, Node.fullTree)
            .filter(
              and(
                hasRole(device, (role) => role.is("region")),
                isIncludedInTheAccessibilityTree(device),
              ),
            )
            // circumventing https://github.com/Siteimprove/alfa/issues/298
            .reject(hasIncorrectRoleWithoutName(device))
        );
      },

      expectations(target) {
        return {
          1: expectation(
            hasNonEmptyAccessibleName(device)(target),
            () => Outcomes.HasName,
            () => Outcomes.HasNoName,
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
  export const HasName = Ok.of(
    Diagnostic.of(`The region has an accessible name`),
  );

  export const HasNoName = Err.of(
    Diagnostic.of(`The region does not have an accessible name`),
  );
}
