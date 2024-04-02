import { Rule } from "@siteimprove/alfa-act";
import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
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
            () => Outcomes.IsUserAgentControlled(name, box),
            () =>
              expectation(
                hasSufficientSize(24, device)(target),
                () => Outcomes.HasSufficientSize(name, box),
                () =>
                  expectation(
                    hasSufficientSpacing(document, device)(target),
                    () => Outcomes.HasSufficientSpacing(name, box),
                    () => Outcomes.HasInsufficientSizeAndSpacing(name, box),
                  ),
              ),
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
    Ok.of(WithBoundingBox.of("Target is user agent controlled", name, box));

  export const HasSufficientSize = (name: string, box: Rectangle) =>
    Ok.of(
      WithBoundingBox.of("Target has sufficient size", name, box, {
        size: true,
      }),
    );

  export const HasSufficientSpacing = (name: string, box: Rectangle) =>
    Ok.of(
      WithBoundingBox.of("Target has sufficient spacing", name, box, {
        size: false,
        spacing: true,
      }),
    );

  export const HasInsufficientSizeAndSpacing = (name: string, box: Rectangle) =>
    Err.of(
      WithBoundingBox.of(
        "Target has insufficient size and spacing",
        name,
        box,
        { size: false, spacing: false },
      ),
    );
}

const spacingCache = Cache.empty<
  Document,
  Cache<Device, Cache<Element, boolean>>
>();

/**
 * @remarks
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
    // The target might have been cached while computing the spacing for another target
    const cachedTarget = spacingCache
      .get(document, Cache.empty)
      .get(device, Cache.empty)
      .get(target);

    if (cachedTarget.isSome()) {
      return cachedTarget.get();
    }

    // Existence of a bounding box is guaranteed by applicability
    const box = target.getBoundingBox(device).getUnsafe();

    for (const otherTarget of targetsOfPointerEvents(document, device)) {
      if (target === otherTarget) {
        continue;
      }

      // Existence of a bounding box is guaranteed by applicability
      const other = otherTarget.getBoundingBox(device).getUnsafe();

      // If the box of the target doesn't intersect with the circumscribed square of the other target, we know they are far enough apart
      if (
        !box.intersects(
          Rectangle.of(other.center.x - 12, other.center.y - 12, 24, 24),
        )
      ) {
        continue;
      }

      // TODO: Check if the 24px diameter circle of the target intersect with the bounding box of the other target

      // If the other target is undersized, the 24px diameter circle of the target must not intersect with the 24px diameter circle of the other target
      if (
        (other.width < 24 || other.height < 24) &&
        (box.center.x - other.center.x) ** 2 +
          (box.center.y - other.center.y) ** 2 <=
          24 ** 2
      ) {
        // If the other is undersized and too close to this we already know it will also fail the rule, so we might as well cache it
        spacingCache
          .get(document, Cache.empty)
          .get(device, Cache.empty)
          .set(otherTarget, false);

        return false;
      }
    }

    return true;
  };
}
