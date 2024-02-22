import { Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Element, Node, Query } from "@siteimprove/alfa-dom";
import { Rectangle } from "@siteimprove/alfa-rectangle";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Device } from "@siteimprove/alfa-device";

import { expectation } from "../common/act/expectation";

import { WithBoundingBox, WithName } from "../common/diagnostic";

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
        // Existence of a bounding box is guaranteed by applicability
        const box = target.getBoundingBox(device).getUnsafe();
        const name = WithName.getName(target, device).getOr("");
        return {
          1: expectation(
            isUserAgentControlled(target),
            () => Outcomes.IsUserAgentControlled(name),
            hasSufficientSize(44, device)(target)
              ? () => Outcomes.HasSufficientSize(name, box)
              : () => Outcomes.HasInsufficientSize(name, box),
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
  export const HasSufficientSize = (name: string, box: Rectangle) =>
    Ok.of(WithBoundingBox.of("Target has sufficient size", name, box));

  export const HasInsufficientSize = (name: string, box: Rectangle) =>
    Err.of(WithBoundingBox.of("Target has insufficient size", name, box));

  export const IsUserAgentControlled = (name: string) =>
    Ok.of(WithName.of("Target is user agent controlled", name));
}

/**
 * @remarks
 * This predicate is assumed to only be used on elements with bounding boxes
 * which should be guaranteed by applicability
 */
function hasSufficientSize(size: number, device: Device): Predicate<Element> {
  return (element) => {
    const box = element.getBoundingBox(device).getUnsafe();
    return box.width >= size && box.height >= size;
  };
}

function isUserAgentControlled(element: Element): boolean {
  // Crude approximation of user agent controlled elements, to be refined
  return element.name === "input";
}
