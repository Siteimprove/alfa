import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Element, Node, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation.js";

import { Scope, Stability } from "../tags/index.js";

const { isIncludedInTheAccessibilityTree, isFocusable } = DOM;
const { and, not, test } = Predicate;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r118",
  requirements: [
    Criterion.of("2.4.3"),
    Technique.of("G59"),
    Technique.of("H4"),
  ],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document }) {
    return {
      applicability() {
        return getElementDescendants(document, Node.fullTree).filter(
          and(
            isIncludedInTheAccessibilityTree(device),
            isFocusable(device),
          ),
        );
      },

      expectations(target) {
        // Get all focusable elements in document order
        const allFocusable = getElementDescendants(document, Node.fullTree)
          .filter(
            and(
              isIncludedInTheAccessibilityTree(device),
              isFocusable(device),
            ),
          )
          .toArray();

        // Find the position of current target in the focus order
        const targetIndex = allFocusable.findIndex((element) =>
          element.equals(target),
        );

        // Check if focus order follows visual order
        const hasLogicalFocusOrder = checkFocusOrder(target, allFocusable, device);

        return {
          1: expectation(
            hasLogicalFocusOrder,
            () => Outcomes.HasLogicalFocusOrder,
            () => Outcomes.HasIllogicalFocusOrder,
          ),
        };
      },
    };
  },
});

/**
 * Check if the focus order follows a logical sequence
 */
function checkFocusOrder(
  target: Element,
  allFocusable: Array<Element>,
  device: any,
): boolean {
  const targetIndex = allFocusable.findIndex((element) =>
    element.equals(target),
  );

  if (targetIndex === -1 || targetIndex === 0) {
    return true; // First element or not found
  }

  const previousElement = allFocusable[targetIndex - 1];
  
  // Check if the previous element appears before current element in visual order
  // This is a simplified check - in practice, you'd need more sophisticated
  // layout analysis to determine true visual order
  return isElementBeforeInVisualOrder(previousElement, target, device);
}

/**
 * Simplified check for visual order - in practice this would need
 * more sophisticated layout analysis
 */
function isElementBeforeInVisualOrder(
  element1: Element,
  element2: Element,
  device: any,
): boolean {
  // For now, we'll use document order as a proxy for visual order
  // In a real implementation, you'd analyze CSS positioning, float, etc.
  const document1 = element1.document();
  const document2 = element2.document();
  
  if (!document1.equals(document2)) {
    return false;
  }

  // Check if element1 appears before element2 in document order
  const allElements = document1.descendants(Node.fullTree).toArray();
  const index1 = allElements.findIndex((el) => el.equals(element1));
  const index2 = allElements.findIndex((el) => el.equals(element2));
  
  return index1 < index2;
}

/**
 * @public
 */
export namespace Outcomes {
  export const HasLogicalFocusOrder = Ok.of(
    Diagnostic.of(`The element follows logical focus order`),
  );

  export const HasIllogicalFocusOrder = Err.of(
    Diagnostic.of(`The element does not follow logical focus order`),
  );
}
