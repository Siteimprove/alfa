import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Element, Namespace, Node, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation.js";

import { Scope, Stability } from "../tags/index.js";

const {
  hasExplicitRole,
  hasNonEmptyAccessibleName,
  isIncludedInTheAccessibilityTree,
} = DOM;
const { hasNamespace } = Element;
const { and } = Predicate;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r43",
  requirements: [Criterion.of("1.1.1")],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ document, device }) {
    return {
      applicability() {
        return getElementDescendants(document, Node.fullTree).filter(
          and(
            hasNamespace(Namespace.SVG),
            hasExplicitRole("img", "graphics-document", "graphics-symbol"),
            isIncludedInTheAccessibilityTree(device),
          ),
        );
      },

      expectations(target) {
        return {
          1: expectation(
            hasNonEmptyAccessibleName(device)(target),
            () => Outcomes.HasName(target.name),
            () => Outcomes.HasNoName(target.name),
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
  export const HasName = (target: string) =>
    Ok.of(Diagnostic.of(`The \`<${target}>\` element has an accessible name`));

  export const HasNoName = (target: string) =>
    Err.of(
      Diagnostic.of(
        `The \`<${target}>\` element does not have an accessible name`,
      ),
    );
}
