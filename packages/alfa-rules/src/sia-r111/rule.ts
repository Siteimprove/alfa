import { Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Element, Node, Query } from "@siteimprove/alfa-dom";
import { Rectangle } from "@siteimprove/alfa-rectangle";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { WithBoundingBox } from "../common/diagnostic";

const { getElementDescendants } = Query;
const { and } = Refinement;
const { hasRole } = DOM;
const { hasComputedStyle, isFocusable } = Style;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r111",
  requirements: [Criterion.of("2.5.5")],
  evaluate({ device, document }) {
    return {
      applicability() {
        return getElementDescendants(document, Node.fullTree).filter(
          and(
            hasComputedStyle(
              "pointer-events",
              (keyword) => keyword.value !== "none",
              device,
            ),
            isFocusable(device),
            hasRole(device, (role) => role.isWidget()),
            (target) => target.getBoundingBox(device).isSome(),
          ),
        );
      },

      expectations(target) {
        // Existence of bounding box is guaranteed by applicability
        const box = target.getBoundingBox(device).getUnsafe();

        return {
          1: expectation(
            box.width >= 44 && box.height >= 44,
            () => Outcomes.HasSufficientSize(box),
            () => Outcomes.HasInsufficientSize(box),
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
  export const HasSufficientSize = (box: Rectangle) =>
    Ok.of(WithBoundingBox.of("Target has sufficient size", box));

  export const HasInsufficientSize = (box: Rectangle) =>
    Err.of(WithBoundingBox.of("Target has insufficient size", box));
}
