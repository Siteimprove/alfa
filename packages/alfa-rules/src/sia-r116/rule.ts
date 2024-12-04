import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM, Role } from "@siteimprove/alfa-aria";
import { Element, Namespace, Node, Query } from "@siteimprove/alfa-dom";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation.js";

import { Scope, Stability } from "../tags/index.js";

const {
  hasExplicitRole,
  hasNonEmptyAccessibleName,
  isIncludedInTheAccessibilityTree,
} = DOM;
const { hasName, hasNamespace, isElement } = Element;
const { and, not } = Refinement;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element<"summary">>({
  uri: "https://alfa.siteimprove.com/rules/sia-r116",
  requirements: [Criterion.of("4.1.2")],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document }) {
    return {
      applicability() {
        return getElementDescendants(document, Node.fullTree)
          .filter(and(hasNamespace(Namespace.HTML), hasName("summary")))
          .filter(
            and(
              isIncludedInTheAccessibilityTree(device),
              (summary) => summary.isSummaryForItsParentDetails(),
              // If the explicit role is none/presentation but the element is
              // nonetheless included in the accessibility tree, then the
              // conflict triggered, and we want to keep it as target.
              not(hasExplicitRole(Role.hasName("none", "presentation"))),
            ),
          );
      },

      expectations(target) {
        return {
          1: expectation(
            // This does not explicitly exclude the ::marker pseudo-element from
            // the name. Since we currently do not handle pseudo-elements, this
            // is effectively the wanted outcome.
            hasNonEmptyAccessibleName(device)(target),
            () => Outcomes.HasAccessibleName,
            () => Outcomes.HasNoAccessibleName,
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
  export const HasAccessibleName = Ok.of(
    Diagnostic.of(`The \`<summary>\` element has an accessible name`),
  );

  export const HasNoAccessibleName = Err.of(
    Diagnostic.of(`The \`<summary>\` element does not have an accessible name`),
  );
}
