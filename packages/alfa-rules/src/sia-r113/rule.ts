import { Rule } from "@siteimprove/alfa-act";
import { Cache } from "@siteimprove/alfa-cache";
import type { Device } from "@siteimprove/alfa-device";
import type { Document, Element } from "@siteimprove/alfa-dom";
import type { Iterable } from "@siteimprove/alfa-iterable";
import { LazyList } from "@siteimprove/alfa-lazy-list";
import { Criterion } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation.js";
import { getClickableRegion } from "../common/dom/get-clickable-region.js";

import {
  getAllTargets,
  getApplicableTargets,
} from "../common/applicability/targets-of-pointer-events.js";

import { WithName } from "../common/diagnostic.js";

import { TargetSize } from "../common/outcome/target-size.js";

import { Rectangle } from "@siteimprove/alfa-rectangle";
import { hasSufficientSize } from "../common/predicate/has-sufficient-size.js";
import { isUserAgentControlled } from "../common/predicate/is-user-agent-controlled.js";

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r113",
  requirements: [Criterion.of("2.5.8")],
  evaluate({ device, document }) {
    return {
      applicability() {
        return getApplicableTargets(document, device);
      },

      expectations(target) {
        const boundingBox = Rectangle.union(
          ...getClickableRegion(device, target),
        );
        const name = WithName.getName(target, device).getOr("");

        return {
          1: expectation(
            isUserAgentControlled()(target),
            () => TargetSize.IsUserAgentControlled(name, boundingBox),
            () =>
              expectation(
                hasSufficientSize(24, device)(target),
                () => TargetSize.HasSufficientSize(name, boundingBox),
                () => {
                  const tooCloseNeighbors = LazyList.from(
                    findElementsWithInsufficientSpacingToTarget(
                      document,
                      device,
                      target,
                    ),
                  );

                  return expectation(
                    tooCloseNeighbors.isEmpty(),
                    () => TargetSize.HasSufficientSpacing(name, boundingBox),
                    () =>
                      TargetSize.HasInsufficientSizeAndSpacing(
                        name,
                        boundingBox,
                        tooCloseNeighbors,
                      ),
                  );
                },
              ),
          ),
        };
      },
    };
  },
});

const undersizedCache = Cache.empty<
  Document,
  Cache<Device, LazyList<Element>>
>();

/**
 * Yields all elements that have insufficient spacing to the target.
 *
 * @remarks
 * The spacing is calculated by drawing a circle around the center of the clickable box of the target of radius 12.
 * The target is underspaced, if
 * 1) the circle intersects with the clickable box of any other target, or
 * 2) the distance between the center of the clickable box of the target
 *    and the center of the clickable box of any other **undersized** target is less than 24.
 */
function* findElementsWithInsufficientSpacingToTarget(
  document: Document,
  device: Device,
  target: Element,
): Iterable<Element> {
  const targetRegion = getClickableRegion(device, target);
  const targetBoundingBox = Rectangle.union(...targetRegion);

  const undersizedTargets = undersizedCache
    .get(document, Cache.empty)
    .get(device, () =>
      getAllTargets(document, device).reject(hasSufficientSize(24, device)),
    );

  // TODO: We could avoid unnecessary comparisons by using a quad tree or similar
  for (const candidate of getAllTargets(document, device)) {
    if (target !== candidate) {
      const candidateRegion = getClickableRegion(device, candidate);
      const candidateBoundingBox = Rectangle.union(...candidateRegion);

      // To determine if an undersized target has sufficient spacing,
      // we check that the 24 CSS pixel diameter circle of the target
      // does not intersect another target or the circle of any other
      // adjacent undersized targets.
      if (
        candidateRegion.some((rect) =>
          rect.intersectsCircle(
            targetBoundingBox.center.x,
            targetBoundingBox.center.y,
            12,
          ),
        ) ||
        (undersizedTargets.includes(candidate) &&
          candidateBoundingBox.distanceSquared(targetBoundingBox) < 24 ** 2)
      ) {
        yield candidate;
      }
    }
  }
}
