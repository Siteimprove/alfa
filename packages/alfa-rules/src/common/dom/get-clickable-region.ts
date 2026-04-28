import { Cache } from "@siteimprove/alfa-cache";
import type { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { PaintingOrder } from "@siteimprove/alfa-painting-order";
import { Rectangle } from "@siteimprove/alfa-rectangle";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Style } from "@siteimprove/alfa-style";

import { isTarget } from "../applicability/targets-of-pointer-events.ts";

const { isVisible, hasComputedStyle } = Style;
const { and, not, or } = Refinement;
const { hasBox } = Node;

/**
 * The result of computing the clickable region for an element, including the
 * rectangles making up the region together with the elements that contributed
 * to or subtracted from it.
 *
 * @internal
 */
export class ClickableRegion {
  public static of(
    rectangles: Sequence<Rectangle>,
    contributors: Sequence<Element>,
    subtractors: Sequence<Element>,
  ): ClickableRegion {
    return new ClickableRegion(rectangles, contributors, subtractors);
  }

  public static empty(): ClickableRegion {
    return new ClickableRegion(
      Sequence.empty(),
      Sequence.empty(),
      Sequence.empty(),
    );
  }

  private constructor(
    /**
     * The rectangles that make up the final clickable region after all
     * additions and subtractions.
     */
    public readonly rectangles: Sequence<Rectangle>,

    /**
     * Elements that contribute area to the clickable region: the element
     * itself and any visible, non-target descendants whose boxes were added.
     */
    public readonly contributors: Sequence<Element>,

    /**
     * Elements that subtract area from the clickable region: elements painted
     * above the target whose bounding boxes overlap it and that intercept
     * pointer events.
     */
    public readonly subtractors: Sequence<Element>,
  ) {}

  /**
   * Returns the bounding box (union) of all rectangles in the clickable region.
   */
  public get boundingBox(): Rectangle {
    return Rectangle.union(...this.rectangles);
  }

  /**
   * Returns true if any rectangle in the region intersects the given circle.
   */
  public intersectsCircle(cx: number, cy: number, r: number): boolean {
    return this.rectangles.some((rect) => rect.intersectsCircle(cx, cy, r));
  }

  /**
   * Returns true if any single rectangle in the region can fit a square of the
   * given side length, i.e. has both width and height ≥ size.
   */
  public fitsSquare(size: number): boolean {
    return this.rectangles.some(
      (rect) => rect.width >= size && rect.height >= size,
    );
  }
}

/**
 * Gets the clickable region for an element, describing the area where the
 * element would receive pointer events together with the elements that
 * contributed to or subtracted from that area.
 *
 * @privateRemarks
 * The clickable region of an element is found by subtracting the bounding
 * boxes of clipping elements and then recursively finding and concatenating
 * the clickable regions of the children that are visible and not themselves
 * targets of pointer events. Here, clipping elements are those elements
 * painted above, whose bounding boxes overlap the element and who are either
 * non-descendants or descendants that are also targets of pointer events.
 *
 * @internal
 */
export const getClickableRegion = Cache.memoize(function (
  device: Device,
  element: Element,
): ClickableRegion {
  if (or(not(isVisible(device)), not(hasBox(() => true, device)))(element)) {
    return ClickableRegion.empty();
  }

  const box = element.getBoundingBox(device).getUnsafe(); // Existence is guaranteed by above check.

  const paintingOrder = PaintingOrder.from(element.root(Node.fullTree), device);

  // Elements painted above that clip this element's clickable region.
  const subtractingElements = Sequence.from(
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
      // Only elements whose box actually intersects (prevents needless subtractions).
      (elementAbove: Element) =>
        elementAbove
          .getBoundingBox(device)
          .some((aboveBox) => aboveBox.intersects(box)),
    ),
  );

  let result = box.subtract(
    ...subtractingElements.collect((above) => above.getBoundingBox(device)),
  );

  const children = element
    .children(Node.fullTree)
    .filter(Element.isElement)
    .filter(and(isVisible(device), not(isTarget(device))));

  let allContributors: Sequence<Element> = Sequence.of(element);
  let allSubtractors: Sequence<Element> = subtractingElements;

  for (const child of children) {
    const childRegion = getClickableRegion(device, child);

    // Only add child boxes that are not already contained in existing boxes.
    const newChildRects = childRegion.rectangles
      .reject((childBox) => result.some((r) => r.contains(childBox)))
      .toArray(); // Force materialisation — lazy reference to `result` causes incorrect results.

    result = result.concat(newChildRects);

    allContributors = allContributors.concat(
      childRegion.contributors.toArray(),
    );
    allSubtractors = allSubtractors.concat(childRegion.subtractors.toArray());
  }

  return ClickableRegion.of(result, allContributors, allSubtractors);
});
