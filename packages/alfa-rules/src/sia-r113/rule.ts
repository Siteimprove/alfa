import { Rule } from "@siteimprove/alfa-act";
import { Cache } from "@siteimprove/alfa-cache";
import type { Device } from "@siteimprove/alfa-device";
import type { Document, Element } from "@siteimprove/alfa-dom";
import type { Iterable } from "@siteimprove/alfa-iterable";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Criterion } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation.js";
import { getClickableBox } from "../common/dom/get-clickable-box.js";

import {
  allTargetsOfPointerEvents,
  applicableTargetsOfPointerEvents,
} from "../common/applicability/targets-of-pointer-events.js";

import { WithName } from "../common/diagnostic.js";

import { TargetSize } from "../common/outcome/target-size.js";

import { hasSufficientSize } from "../common/predicate/has-sufficient-size.js";
import { isUserAgentControlled } from "../common/predicate/is-user-agent-controlled.js";

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r113",
  requirements: [Criterion.of("2.5.8")],
  evaluate({ device, document }) {
    return {
      applicability() {
        return applicableTargetsOfPointerEvents(document, device);
      },

      expectations(target) {
        // Existence of a clickable box is guaranteed by applicability
        const box = getClickableBox(device, target).getUnsafe();
        const name = WithName.getName(target, device).getOr("");

        return {
          1: expectation(
            isUserAgentControlled()(target),
            () => TargetSize.IsUserAgentControlled(name, box),
            () =>
              expectation(
                hasSufficientSize(24, device)(target),
                () => TargetSize.HasSufficientSize(name, box),
                () => {
                  const tooCloseNeighbors = Sequence.from(
                    findElementsWithInsufficientSpacingToTarget(
                      document,
                      device,
                      target,
                    ),
                  );

                  return expectation(
                    tooCloseNeighbors.isEmpty(),
                    () => TargetSize.HasSufficientSpacing(name, box),
                    () =>
                      TargetSize.HasInsufficientSizeAndSpacing(
                        name,
                        box,
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
  Cache<Device, Sequence<Element>>
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
  // Existence of a clickable box is guaranteed by applicability
  const targetRect = getClickableBox(device, target).getUnsafe();

  const undersizedTargets = undersizedCache
    .get(document, Cache.empty)
    .get(device, () =>
      allTargetsOfPointerEvents(document, device).reject(
        hasSufficientSize(24, device),
      ),
    );

  // TODO: We could avoid unnecessary comparisons by using a quad tree or similar
  for (const candidate of allTargetsOfPointerEvents(document, device)) {
    if (target !== candidate) {
      // Existence of a clickable box should be guaranteed by implementation of allTargetsOfPointerEvents
      const candidateRect = getClickableBox(device, candidate).getUnsafe();

      if (
        candidateRect.intersectsCircle(
          targetRect.center.x,
          targetRect.center.y,
          12,
        ) ||
        (undersizedTargets.includes(candidate) &&
          targetRect.distanceSquared(candidateRect) < 24 ** 2)
      ) {
        // The 24px diameter circle of the target must not intersect with the clickable box of any other target, or
        // if the candidate is undersized, the 24px diameter circle of the target must not intersect with the 24px diameter circle of the candidate
        yield candidate;
      }
    }
  }
}
