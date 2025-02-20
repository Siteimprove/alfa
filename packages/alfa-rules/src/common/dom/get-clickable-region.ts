import { Cache } from "@siteimprove/alfa-cache";
import type { Device } from "@siteimprove/alfa-device";
import { type Element, Node, Query } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { PaintingOrder } from "@siteimprove/alfa-painting-order";
import { Rectangle } from "@siteimprove/alfa-rectangle";
import { Err, Result } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Style } from "@siteimprove/alfa-style";

const { getInclusiveElementDescendants } = Query;
const { isVisible, hasComputedStyle } = Style;

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

  let boxes: Array<Rectangle> = [];
  for (let box of getInclusiveElementDescendants(element)
    .filter(isVisible(device))
    .map((element) => element.getBoundingBox(device))) {
    if (!box.isSome()) {
      return Err.of(
        "The element of one its descendants does not have a bounding box.",
      );
    }

    boxes.push(box.get());
  }

  let result = Sequence.of(Rectangle.union(...boxes));

  for (const above of Iterable.filter(
    PaintingOrder.from(element.root(Node.fullTree), device).getElementsAbove(
      element,
    ),
    hasComputedStyle("pointer-events", ({ value }) => value !== "none", device),
  )) {
    const box = above.getBoundingBox(device);
    if (box.isSome()) {
      result = result.flatMap((rect) => rect.subtract(box.get()));
    }

    if (result.isEmpty()) {
      return Err.of(
        "The element does not have a clickable box because it's completely covered by other elements.",
      );
    }
  }

  return Result.of(result);
});
