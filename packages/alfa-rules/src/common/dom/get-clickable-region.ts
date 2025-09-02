import { Cache } from "@siteimprove/alfa-cache";
import type { Device } from "@siteimprove/alfa-device";
import { Element, Node, Query } from "@siteimprove/alfa-dom";
import { PaintingOrder } from "@siteimprove/alfa-painting-order";
import { Polygon } from "@siteimprove/alfa-rectangle";
import { Style } from "@siteimprove/alfa-style";

const { hasComputedStyle, isVisible } = Style;

/**
 * @internal
 */
export const getClickableRegion = Cache.memoize(function (
  device: Device,
  element: Element,
): Polygon {
  const hasPointerEventsNone = hasComputedStyle(
    "pointer-events",
    ({ value }) => value === "none",
    device,
  );
  const box = element.getBoundingBox(device);

  if (!isVisible(device)(element) || !box.isSome()) {
    return Polygon.empty();
  }

  const paintingOrder = PaintingOrder.from(element.root(Node.fullTree), device);

  const polygon = Polygon.empty();
  polygon.add(box.get());

  for (const above of paintingOrder.getElementsAbove(element)) {
    const aboveBox = above.getBoundingBox(device);
    if (
      aboveBox.isSome() &&
      aboveBox.get().intersects(box.get()) &&
      !hasPointerEventsNone(above) &&
      !above.isAncestorOf(element) &&
      !above.isDescendantOf(element)
    ) {
      polygon.subtract(aboveBox.get());
    }
  }

  for (const child of element.children(Node.fullTree)) {
    if (Element.isElement(child)) {
      for (const rect of getClickableRegion(device, child).rectangles) {
        polygon.add(rect);
      }
    }
  }

  return polygon;
});
