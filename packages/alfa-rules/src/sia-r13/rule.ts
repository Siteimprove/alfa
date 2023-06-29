import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Element, Namespace, Node, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { Scope, Stability } from "../tags";

const { hasNonEmptyAccessibleName, isIncludedInTheAccessibilityTree } = DOM;
const { hasName, hasNamespace, hasTabIndex } = Element;
const { and, not } = Predicate;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r13",
  requirements: [Criterion.of("4.1.2")],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document }) {
    return {
      applicability() {
        return getElementDescendants(document, Node.fullTree).filter(
          and(
            hasNamespace(Namespace.HTML),
            hasName("iframe"),
            isIncludedInTheAccessibilityTree(device),
            not(hasTabIndex((n) => n < 0))
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
    Diagnostic.of(`The \`<iframe>\` has an accessible name`)
  );

  export const HasNoName = Err.of(
    Diagnostic.of(`The \`<iframe>\` does not have an accessible name`)
  );
}
