import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Element, Namespace, Node, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation.js";

import { Scope, Stability } from "../tags/index.js";

const { hasNonEmptyAccessibleName, hasRole, isIncludedInTheAccessibilityTree } =
  DOM;
const { hasNamespace } = Element;
const { and } = Predicate;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r11",
  requirements: [
    Criterion.of("2.4.4"),
    Criterion.of("2.4.9"),
    Criterion.of("4.1.2"),
    Technique.of("G91"),
  ],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document }) {
    return {
      applicability() {
        return getElementDescendants(document, Node.fullTree).filter(
          and(
            hasNamespace(Namespace.HTML),
            hasRole(device, (role) => role.is("link")),
            isIncludedInTheAccessibilityTree(device),
          ),
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
    Diagnostic.of(`The link has an accessible name`),
  );

  export const HasNoName = Err.of(
    Diagnostic.of(`The link does not have an accessible name`),
  );
}
