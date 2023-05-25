import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Unit } from "@siteimprove/alfa-css";
import { Element, Node, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { Scope } from "../tags";

const { hasRole } = DOM;
const { and } = Predicate;
const { isVisible, hasCascadedStyle } = Style;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r74",
  requirements: [Criterion.of("1.4.8")],
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return getElementDescendants(document, Node.fullTree).filter(
          and(
            hasRole(device, "paragraph"),
            hasCascadedStyle(
              "font-size",
              (fontSize) => {
                switch (fontSize.type) {
                  case "length":
                  case "percentage":
                    return fontSize.value > 0;
                  default:
                    return true;
                }
              },
              device
            ),
            Node.hasTextContent(),
            isVisible(device)
          )
        );
      },

      expectations(target) {
        const { value: fontSize } = Style.from(target, device)
          .cascaded("font-size")
          // Presence of a cascaded value is guaranteed by filter in applicability
          .getUnsafe();

        return {
          1: expectation(
            fontSize.type !== "length" || Unit.Length.isRelative(fontSize.unit),
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
    Diagnostic.of(`The font size is specified using a relative unit`)
  );

  export const HasAbsoluteUnit = Err.of(
    Diagnostic.of(`The font size is specified using an absolute unit`)
  );
}
