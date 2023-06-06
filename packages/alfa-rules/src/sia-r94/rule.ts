import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Element, Namespace, Node, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { Scope } from "../tags";

const { hasNonEmptyAccessibleName, hasRole, isIncludedInTheAccessibilityTree } =
  DOM;
const { hasNamespace } = Element;
const { and } = Predicate;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r94",
  requirements: [Criterion.of("4.1.2")],
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return getElementDescendants(document, Node.fullTree).filter(
          and(
            hasNamespace(Namespace.HTML),
            hasRole(device, "menuitem"),
            isIncludedInTheAccessibilityTree(device)
          )
        );
      },

      expectations(target) {
        return {
          1: expectation(
            hasNonEmptyAccessibleName(device)(target),
            () => Outcomes.HasName,
            () => Outcomes.HasNoName
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
    Diagnostic.of(`The menuitem has an accessible name`)
  );

  export const HasNoName = Err.of(
    Diagnostic.of(`The menuitem does not have an accessible name`)
  );
}
