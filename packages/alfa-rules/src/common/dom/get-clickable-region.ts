import { Cache } from "@siteimprove/alfa-cache";
import type { Device } from "@siteimprove/alfa-device";
import { type Element, Node, Query } from "@siteimprove/alfa-dom";
import { PaintingOrder } from "@siteimprove/alfa-painting-order";
import { Rectangle } from "@siteimprove/alfa-rectangle";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Result } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Style } from "@siteimprove/alfa-style";

import { isTarget } from "../applicability/targets-of-pointer-events.js";

const { getInclusiveElementDescendants } = Query;
const { isVisible, hasComputedStyle } = Style;

const { and, or } = Refinement;

/**
 * Gets the clickable region of an element or an error if the element or one of its
 * descendants doesn't have a bounding box or if the element itself is not visible.
 * The clickable region is represented as a collection of rectangles since an element
 * might be clipped by other elements, fragmenting its clickable region.
 *
 * @remarks
 * This function assumes that the element can receive pointer events, i.e. is clickable.
 * If called on an element that is not clickable, the function will still return the
 * the area that would be clickable if the element could receive pointer events.
 *
 * The clickable box is approximated by the smallest rectangle containing
 * the bounding boxes of the element and all its visible descendants.
 *
 * @internal
 */
export const getClickableRegion = Cache.memoize(function (
  device: Device,
  element: Element,
): Result<Sequence<Rectangle>, string> {
  if (!isVisible(device)(element)) {
    return Err.of("Cannot get clickable box of an invisible element.");
  }
  const paintingOrder = PaintingOrder.from(element.root(Node.fullTree), device);

  let result = Sequence.empty<Rectangle>();

  for (const descendant of getInclusiveElementDescendants(element).filter(
    isVisible(device),
  )) {
    const box = descendant.getBoundingBox(device);
    if (!box.isSome()) {
      return Err.of(
        "The element of one its descendants does not have a bounding box.",
      );
    }

    const diff = subtractNonDescendantsAndTargets(
      box.get(),
      paintingOrder,
      element,
      device,
    );
    result = result.concat(diff);
  }

  if (result.isEmpty()) {
    return Err.of(
      "The element does not have a clickable box because it's completely covered by other elements.",
    );
  }

  return Result.of(result);
});

function subtractNonDescendantsAndTargets(
  box: Rectangle,
  paintingOrder: PaintingOrder,
  element: Element,
  device: Device,
): Sequence<Rectangle> {
  const nonDescendantsAbove = Sequence.from(
    paintingOrder.getElementsAbove(element),
  ).filter(
    and(
      hasComputedStyle(
        "pointer-events",
        ({ value }) => value !== "none",
        device,
      ),
      or(
        (elementAbove: Element) =>
          !element.isAncestorOf(elementAbove, Node.fullTree),
        isTarget(device),
      ),
    ),
  );

  let result = Sequence.of(box);

  for (const above of nonDescendantsAbove) {
    const box = above.getBoundingBox(device);
    if (box.isSome()) {
      result = result.flatMap((rect) => rect.subtract(box.get()));
    }

    if (result.isEmpty()) {
      return result;
    }
  }

  return result;
}
