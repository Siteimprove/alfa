import { Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element, Node } from "@siteimprove/alfa-dom";
import { Either } from "@siteimprove/alfa-either";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Rectangle } from "@siteimprove/alfa-rectangle";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Style } from "@siteimprove/alfa-style";

import { expectation } from "../common/act/expectation";

import { targetsOfPointerEvents } from "../common/applicability/targets-of-pointer-events";

import { WithBoundingBox, WithName } from "../common/diagnostic";

import { hasSufficientSize } from "../common/predicate/has-sufficient-size";
import { isUserAgentControlled } from "../common/predicate/is-user-agent-controlled";
import { hasName } from "@siteimprove/alfa-aria/src/role/predicate";

const { and } = Predicate;
const { hasComputedStyle, isFocusable, isVisible } = Style;
const { hasRole } = DOM;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r113",
  requirements: [Criterion.of("2.5.8")],
  evaluate({ device, document }) {
    return {
      applicability() {
        // Strategy: Traverse tree and
        // 1) reject subtrees that are text blocks, see sia-r62
        // 2) collect targets of pointer events

        const isParagraph = hasRole(device, "paragraph");
        const targetOfPointerEvent = and(
          hasComputedStyle(
            "pointer-events",
            (keyword) => keyword.value !== "none",
            device,
          ),
          isFocusable(device),
          isVisible(device),
          hasRole(device, (role) => role.isWidget()),
          (target) => target.getBoundingBox(device).isSome(),
        );

        let targets: Array<Element> = [];

        function visit(node: Node): void {
          if (Element.isElement(node)) {
            if (isParagraph(node)) {
              // If we encounter a paragraph, we can skip the entire subtree
              return;
            }

            if (targetOfPointerEvent(node)) {
              targets.push(node);
            }
          }

          for (const child of node.children(Node.fullTree)) {
            visit(child);
          }
        }

        visit(document);

        return Sequence.from(targets);

        // return targetsOfPointerEvents(document, device);
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
                    () => Outcomes.HasSufficientSpacing(name, box),
                    () =>
                      Outcomes.HasInsufficientSizeAndSpacing(
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
        [],
      ),
    );

  export const HasSufficientSize = (name: string, box: Rectangle) =>
    Ok.of(
      WithBoundingBox.of(
        "Target has sufficient size",
        name,
        box,
        Either.right({ size: true, spacing: true }),
        [],
      ),
    );

  export const HasSufficientSpacing = (name: string, box: Rectangle) =>
    Ok.of(
      WithBoundingBox.of(
        "Target has sufficient spacing",
        name,
        box,
        Either.right({ size: false, spacing: true }),
        [],
      ),
    );

  export const HasInsufficientSizeAndSpacing = (
    name: string,
    box: Rectangle,
    tooCloseNeighbors: Iterable<Element>,
  ) =>
    Err.of(
      WithBoundingBox.of(
        "Target has insufficient size and spacing",
        name,
        box,
        Either.right({ size: false, spacing: false }),
        tooCloseNeighbors,
      ),
    );
}

const undersizedCache = Cache.empty<
  Document,
  Cache<Device, Sequence<Element>>
>();

/**
 * Yields all elements that have insufficient spacing to the target.
 *
 * @remarks
 * The spacing is calculated by drawing a circle around the center of the bounding box of the target of radius 12.
 * The target is underspaced, if
 * 1) the circle intersects with the bounding box of any other target, or
 * 2) the distance between the center of the bounding box of the target
 *    and the center of the bounding box of any other **undersized** target is less than 24.
 */
function* findElementsWithInsufficientSpacingToTarget(
  document: Document,
  device: Device,
  target: Element,
): Iterable<Element> {
  // Existence of a bounding box is guaranteed by applicability
  const targetRect = target.getBoundingBox(device).getUnsafe();

  const undersizedTargets = undersizedCache
    .get(document, Cache.empty)
    .get(device, () =>
      targetsOfPointerEvents(document, device).reject(
        hasSufficientSize(24, device),
      ),
    );

  // TODO: This needs to be optimized, we should be able to use some spatial data structure like a quadtree to reduce the number of comparisons
  for (const candidate of targetsOfPointerEvents(document, device)) {
    if (target !== candidate) {
      // Existence of a bounding box is guaranteed by applicability
      const candidateRect = candidate.getBoundingBox(device).getUnsafe();

      if (
        candidateRect.intersectsCircle(
          targetRect.center.x,
          targetRect.center.y,
          12,
        ) ||
        (undersizedTargets.includes(candidate) &&
          targetRect.distanceSquared(candidateRect) < 24 ** 2)
      ) {
        // The 24px diameter circle of the target must not intersect with the bounding box of any other target, or
        // if the candidate is undersized, the 24px diameter circle of the target must not intersect with the 24px diameter circle of the candidate
        yield candidate;
      }
    }
  }
}
