import { Rule } from "@siteimprove/alfa-act";
import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element } from "@siteimprove/alfa-dom";
import { Either } from "@siteimprove/alfa-either";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Rectangle } from "@siteimprove/alfa-rectangle";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
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
    Ok.of(
      WithBoundingBox.of(
        "Target is user agent controlled",
        name,
        box,
        Either.left({ ua: true }),
      ),
    );

  export const HasSufficientSize = (name: string, box: Rectangle) =>
    Ok.of(
      WithBoundingBox.of(
        "Target has sufficient size",
        name,
        box,
        Either.right({ size: true, spacing: true }),
      ),
    );

  export const HasSufficientSpacing = (name: string, box: Rectangle) =>
    Ok.of(
      WithBoundingBox.of(
        "Target has sufficient spacing",
        name,
        box,
        Either.right({ size: false, spacing: true }),
      ),
    );

  export const HasInsufficientSizeAndSpacing = (name: string, box: Rectangle) =>
    Err.of(
      WithBoundingBox.of(
        "Target has insufficient size and spacing",
        name,
        box,
        Either.right({ size: false, spacing: false }),
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
// TODO: Return all offending other candidates
function hasSufficientSpacing(
  document: Document, // TODO: Should we pass in the targets instead?
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
        // The 24px diameter circle of the target must not intersect with the bounding box of any other target
        return false;
      }

      if (
        // If the candidate is undersized, the 24px diameter circle of the target must not intersect with the 24px diameter circle of the candidate
        undersizedTargets.includes(candidate) &&
        distanceSquared(targetRect, candidateRect) < 24 ** 2
      ) {
        return false;
      }
    }

    return true;
  };
}

/**
 * TODO: Add link to docs/image
 *
 * TODO: Move to alfa-rectangle
 *
 * @internal
 */
export function circleIntersectsRect(
  cx: number,
  cy: number,
  r: number,
  rect: Rectangle,
): boolean {
  // To check intersection, we pad the rectangle by the radius of the circle and divide the problem into three cases:
  //
  // 1. The circle center is outside the padded rectangle.
  // 2. The circle center is inside the padded rectangle, but not in one of the corners.
  // 3. The circle center lies in one of the corners of the padded rectangle in which case we need to compute the distance to the corner
  //
  //
  //    ***          -------------------------------------
  //  *    r*        |    |r                        |    |
  // *   1---*       | r  |                         |    |
  //  *     *        |---- ------------------------- ----|
  //    ***          |    |                         |    |
  //                 |    |                         |    |
  //                 |    |            *            |    |
  //                 |    |                         |    |
  //                 |    |                         |    |
  //                 |---- ------------------------- ----|
  //                 |    |            2            |    |
  //                 |3   |                         |    |
  //                 -------------------------------------
  //
  //    |------------- dx -------------|
  //                 |-- halfwidth+r --|
  //

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
  if (dx <= halfWidth || dy <= halfHeight) {
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
