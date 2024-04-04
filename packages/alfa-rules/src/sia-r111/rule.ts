import { Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Left, Right } from "@siteimprove/alfa-either";
import { Rectangle } from "@siteimprove/alfa-rectangle";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { targetsOfPointerEvents } from "../common/applicability/targets-of-pointer-events";

import { WithBoundingBox, WithName } from "../common/diagnostic";

import { hasSufficientSize } from "../common/predicate/has-sufficient-size";
import { isUserAgentControlled } from "../common/predicate/is-user-agent-controlled";

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r111",
  requirements: [Criterion.of("2.5.5")],
  evaluate({ device, document }) {
    return {
      applicability() {
        return targetsOfPointerEvents(document, device);
      },

      expectations(target) {
        // Existence of a bounding box is guaranteed by applicability
        const box = target.getBoundingBox(device).getUnsafe();
        const name = WithName.getName(target, device).getOr("");
        return {
          1: expectation(
            isUserAgentControlled()(target),
            () => Outcomes.IsUserAgentControlled(name, box),
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
  export const IsUserAgentControlled = (name: string, box: Rectangle) =>
    Ok.of(
      WithBoundingBox.of(
        "Target is user agent controlled",
        name,
        box,
        Left.of({ ua: true }),
      ),
    );

  export const HasSufficientSize = (name: string, box: Rectangle) =>
    Ok.of(
      WithBoundingBox.of(
        "Target has sufficient size",
        name,
        box,
        Right.of({ size: true, spacing: true }),
      ),
    );

  export const HasInsufficientSize = (name: string, box: Rectangle) =>
    Err.of(
      WithBoundingBox.of(
        "Target has insufficient size",
        name,
        box,
        Right.of({ size: false, spacing: true }),
      ),
    );
}
