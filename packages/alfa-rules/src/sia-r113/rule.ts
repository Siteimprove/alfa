import { Rule } from "@siteimprove/alfa-act";
import { Document, Element } from "@siteimprove/alfa-dom";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";
import { Device } from "@siteimprove/alfa-device";
import { Predicate } from "@siteimprove/alfa-predicate";

import { expectation } from "../common/act/expectation";

import { targetsOfPointerEvents } from "../common/applicability/targets-of-pointer-events";

import { WithName } from "../common/diagnostic";

import { isUserAgentControlled } from "../common/predicate/is-user-agent-controlled";
import { hasSufficientSize } from "../common/predicate/has-sufficient-size";

import { BoundingBox } from "../common/outcome/bounding-box";

const { or } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r113",
  requirements: [Criterion.of("2.5.8")],
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
            () => BoundingBox.IsUserAgentControlled(name, box),
            hasSufficientSizeOrSpacing(document, device)(target)
              ? () => BoundingBox.HasSufficientSize(name, box)
              : () => BoundingBox.HasInsufficientSize(name, box),
          ),
        };
      },
    };
  },
});

function hasSufficientSizeOrSpacing(
  document: Document,
  device: Device,
): Predicate<Element> {
  return or(
    hasSufficientSize(24, device),
    hasSufficientSpacing(document, device),
  );
}

/**
 * Spacing is calculated by
 * 1. drawing a 24px diameter circle around the center of the bounding box of the target,
 * 2. checking if the circle intersects with the bounding box of any other target, or
 * 3. if the circle intersects with the 24px diameter circle of another undersized target.
 */
function hasSufficientSpacing(
  document: Document,
  device: Device,
): Predicate<Element> {
  return (target) => {
    const box = target.getBoundingBox(device).getUnsafe();

    for (const otherTarget of targetsOfPointerEvents(document, device)) {
      if (target === otherTarget) {
        continue;
      }

      const other = otherTarget.getBoundingBox(device).getUnsafe();

      // TODO: Check if the 24px diameter circle of the target intersect with the bounding box of the other target

      if (other.width < 24 || other.height < 24) {
        if (
          (box.center.x - other.center.x) ** 2 +
            (box.center.y - other.center.y) ** 2 <
          576
        ) {
          return false;
        }
      }
    }

    return true;
  };
}
