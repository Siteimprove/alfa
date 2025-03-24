import { Cache } from "@siteimprove/alfa-cache";
import type { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { PaintingOrder } from "@siteimprove/alfa-painting-order";
import { Rectangle } from "@siteimprove/alfa-rectangle";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Style } from "@siteimprove/alfa-style";

import { isTarget } from "../applicability/targets-of-pointer-events.js";

const { isVisible, hasComputedStyle } = Style;
const { and, not, or } = Refinement;
const { hasBox } = Element;

/**
 * Gets a collection of rectangles covering the region where an element would
 * receive pointer events. If the element is invisible or the region is empty
 * an error is returned.
 *
 * @privateRemarks
 * The clickable region of an element is found by subtracting the bounding
 * boxes of clipping elements and then recursively finding and concatenating
 * the clickable regions of the children that are visible and not themselves
 * targets of pointer event. Here, clipping elements are those elements painted
 * above, whose bounding boxes overlap the element and who are either
 * non-descendants or descendants that are also targets of pointer events.
 *
 * @internal
 */
export const getClickableRegion = Cache.memoize(function (
  device: Device,
  element: Element,
): Sequence<Rectangle> {
  if (or(not(isVisible(device)), not(hasBox(() => true, device)))(element)) {
    return Sequence.empty<Rectangle>();
  }

  const box = element.getBoundingBox(device).getUnsafe(); // Existence is guaranteed by above check.

  const paintingOrder = PaintingOrder.from(element.root(Node.fullTree), device);

  let result = box.subtract(
    ...Sequence.from(paintingOrder.getElementsAbove(element))
      .filter(
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
      )
      .collect((above) => above.getBoundingBox(device))
      .filter((above) => above.intersects(box)), // Not strictly necessary, but prevents a lot of needles subtractions.
  );

  const children = element
    .children(Node.fullTree)
    .filter(Element.isElement)
    .filter(and(isVisible(device), not(isTarget(device))));

  for (const child of children) {
    // Only add the child boxes if they contribute to the region, i.e. are not
    // contained in any already added boxes.
    result = result.concat(
      getClickableRegion(device, child)
        .reject((childBox) => result.some((box) => box.contains(childBox)))
        .toArray(), // The reference to `result` in the above and the lazyness of `Sequence` causes incorrect results, so we have to force the sequence to materialize
    );
  }

  return result;
});
