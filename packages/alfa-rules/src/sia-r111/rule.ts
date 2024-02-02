import { Page } from "@siteimprove/alfa-web";
import { Element, Query, Node } from "@siteimprove/alfa-dom";
import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Err, Ok } from "@siteimprove/alfa-result";
import { DOM } from "@siteimprove/alfa-aria";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Style } from "@siteimprove/alfa-style";

import { expectation } from "../common/act/expectation";

const { getElementDescendants } = Query;
const { and } = Refinement;
const { hasRole } = DOM;
const { hasComputedStyle, isFocusable } = Style;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r111",
  requirements: [], // TODO: Not sure how to determine these
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
            () => Outcomes.HasSufficientSize,
            () => Outcomes.HasInsufficientSize,
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
  export const HasSufficientSize = Ok.of(
    Diagnostic.of("Target has sufficient size"),
  );

  export const HasInsufficientSize = Err.of(
    Diagnostic.of("Target has insufficient size"),
  );
}
