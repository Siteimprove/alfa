import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Length } from "@siteimprove/alfa-css";
import { Element, Node, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { Scope, Stability } from "../tags";

const { hasRole } = DOM;
const { and } = Predicate;
const { isVisible, hasCascadedStyle } = Style;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r74",
  requirements: [Criterion.of("1.4.8")],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document }) {
    return {
      applicability() {
        return getElementDescendants(document, Node.fullTree).filter(
          and(
            hasRole(device, "paragraph"),
            Node.hasTextContent(),
            isVisible(device),
            // If the font-size ultimately computes to size 0, the element is not
            // visible.
            hasCascadedStyle("font-size", () => true, device),
          ),
        );
      },

      expectations(target) {
        const { value: fontSize } = Style.from(target, device)
          .cascaded("font-size")
          // Presence of a cascaded value is guaranteed by filter in applicability
          .getUnsafe();

        return {
          1: expectation(
            // Keyword, percentage, number
            !Length.isLength(fontSize) ||
              // Calculated length
              fontSize.hasCalculation() ||
              // Fixed length in relative units
              fontSize.isRelative(),
            () => Outcomes.HasRelativeUnit,
            () => Outcomes.HasAbsoluteUnit,
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
  export const HasRelativeUnit = Ok.of(
    Diagnostic.of(`The font size is specified using a relative unit`),
  );

  export const HasAbsoluteUnit = Err.of(
    Diagnostic.of(`The font size is specified using an absolute unit`),
  );
}
