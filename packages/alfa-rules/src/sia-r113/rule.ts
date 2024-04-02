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
import { Sequence } from "@siteimprove/alfa-sequence";

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

const undersizedCache = Cache.empty<
  Document,
  Cache<Device, Sequence<Element>>
>();

/**
 * @remarks
 * This predicate tests that the target has sufficient spacing around it.
 * The spacing is calculated by drawing a circle around the center of the bounding box of the target of radius 12.
 * The target is underspaced, if
 * 1) the circle intersects with the bounding box of any other target, or
 * 2) the distance between the center of the bounding box of the target
 *    and the center of the bounding box of any other **undersized** target is less than 24.
 */
function hasSufficientSpacing(
  document: Document,
  device: Device,
): Predicate<Element> {
  return (target) => {
    // Existence of a bounding box is guaranteed by applicability
    const targetRect = target.getBoundingBox(device).getUnsafe();

    const undersizedTargets = undersizedCache
      .get(document, Cache.empty)
      .get(device, () =>
        targetsOfPointerEvents(document, device).reject(
          hasSufficientSize(24, device),
        ),
      );

    for (const candidate of targetsOfPointerEvents(document, device)) {
      if (target === candidate) {
        continue;
      }

      // Existence of a bounding box is guaranteed by applicability
      const candidateRect = candidate.getBoundingBox(device).getUnsafe();

      if (
        circleIntersectsRect(
          targetRect.center.x,
          targetRect.center.y,
          12,
          candidateRect,
        )
      ) {
        return false;
      }

      if (
        undersizedTargets.includes(candidate) &&
        distanceSquared(targetRect, candidateRect) < 24 ** 2
      ) {
        return false;
      }
    }

    return true;
  };
}

function circleIntersectsRect(
  cx: number,
  cy: number,
  r: number,
  rect: Rectangle,
): boolean {
  // To check intersection, we pad the rectangle by the radius of the circle and divide the problem into three cases:
  // 1. The circle center is outside the padded rectangle.
  // 2. The circle center is inside the padded rectangle, but not in one of the corners.
  // 3. The circle center lies in one of the corners of the padded rectangle.

  const center = rect.center;
  const halfWidth = rect.width / 2;
  const halfHeight = rect.height / 2;

  const dx = Math.abs(cx - center.x);
  const dy = Math.abs(cy - center.y);

  if (dx > halfWidth + r || dy > halfHeight + r) {
    // The circle center is outside the padded rectangle
    return false;
  }

  // The circle center is inside the padded rectangle
  if (dx <= rect.width / 2 || dy <= rect.height / 2) {
    // The circle lies at most a radius away from the rectangle in the x or y directions
    return true;
  }

  // The circle center lies in one of the corners of the padded rectangle.
  // If the distance from the circle center to the closest corner of the rectangle
  // is less than the radius of the circle, the circle intersects the rectangle.
  return (dx - halfWidth) ** 2 + (dy - halfHeight) ** 2 <= r ** 2;
}

function distanceSquared(rect1: Rectangle, rect2: Rectangle): number {
  const c1 = rect1.center;
  const c2 = rect2.center;
  return (c1.x - c2.x) ** 2 + (c1.y - c2.y) ** 2;
}
