import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Length, Unit } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { Scope } from "../tags";

const { hasRole } = DOM;
const { and, test } = Predicate;
const { isVisible, hasCascadedStyle } = Style;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r80",
  requirements: [Criterion.of("1.4.8")],
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .elementDescendants(Node.fullTree)
          .filter(
            and(
              hasRole(device, "paragraph"),
              (element) =>
                Style.from(element, device).cascaded("line-height").isSome(),
              Node.hasTextContent(),
              isVisible(device)
            )
          );
      },

      expectations(target) {
        return {
          1: expectation(
            test(hasRelativeUnit(device), target),
            () => Outcomes.HasRelativeUnit,
            () => Outcomes.HasAbsoluteUnit
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
    Diagnostic.of(`The line height is specified using a relative unit`)
  );

  export const HasAbsoluteUnit = Err.of(
    Diagnostic.of(`The line height is specified using an absolute unit`)
  );
}

/**
 * @remarks
 * We consider that calculated lengths have a relative unit (and pass the rule)
 * since we cannot easily detect it here. We should instead dig into the
 * calculation to see if relative units are used, but that could be made difficult
 * with hings like "2em * 0" which is **not** a relative length…
 */
function hasRelativeUnit(device: Device) {
  return hasCascadedStyle(
    "line-height",
    (lineHeight) =>
      // Keyword, percentage, number
      !Length.isLength(lineHeight) ||
      // Calculated length
      lineHeight.hasCalculation() ||
      // Fixed length in relative units
      lineHeight.isRelative(),
    device
  );
}
