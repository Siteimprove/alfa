import { Cache } from "@siteimprove/alfa-cache";
import { Length, LengthPercentage, Numeric } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Context } from "@siteimprove/alfa-selector";
import { getPositioningParent } from "../../element/helpers/get-positioning-parent";

import { Style } from "../../style";
import { hasPositioningParent } from "../../element/predicate/has-positioning-parent";

const { abs } = Math;
const { isElement, hasBox } = Element;
const { not, or, test } = Predicate;
const { and } = Refinement;

const cache = Cache.empty<Device, Cache<Context, Cache<Node, boolean>>>();

/**
 * Checks if a node (or one of its ancestor) is fully clipped
 *
 * @internal
 */
export function isClipped(
  device: Device,
  context: Context = Context.empty()
): Predicate<Node> {
  return (node) =>
    cache
      .get(device, Cache.empty)
      .get(context, Cache.empty)
      .get(node, () =>
        test(
          or(
            // Either it is a clipped element
            and(
              isElement,
              or(
                isClippedBySize(device, context),
                isClippedByIndent(device, context),
                isClippedByMasking(device, context),
                // We only check moving away in presence of layout.
                and(hasBox(), isClippedByMovingAway(device)),
                // Or it is an element whose positioning parent is clipped
                hasPositioningParent(device, isClipped(device, context))
              )
            ),
            // Or (it's not an element) and its parent is clipped
            and(not(isElement), (node: Node) =>
              node.parent(Node.fullTree).some(isClipped(device, context))
            )
          ),
          node
        )
      );
}

/**
 * Checks if an element's size is reduced to 0 or 1 pixel, and overflow is
 * somehow hidden.
 *
 * @remarks
 * Although 1px is theoretically visible, many clipping technique reduce size to
 * 1px instead of 0. Thus we consider that it is enough.
 *
 * Most clipping techniques reduce both axis to 0 or 1 px, not just one. This, on
 * overall, tends to make this check a bit more robust.
 *
 * Clipping occurs at the border, thus including the padding. It is possible
 * for an element to clip overflow, and have a width/height of 0, yet still show
 * content in its padding area. This should probably also look into padding size.
 * So far, we haven't encountered problem due to that. Presumably, content that
 * is meant to be clipped is correctly put in elements without padding, and the
 * incorrect clipping would be easily detected by visual regression test early on.
 *
 * The boxes we get with getBoundingClientRect include padding (and border).
 * Thus, when these boxes have width/height of 0 and the content is clipped, we
 * are fairly sure that nothing shows.
 *
 * We mostly work on a per-dimension basis. In each axis, check whether the size
 * is 0 or 1; and whether the corresponding overflow is clip or hidden.
 * However, the presence of a guaranteed scrollbar (overflow of "scroll") in *any*
 * dimension will always show something in a 1px size, so we consider these as
 * not clipped.
 */
function isClippedBySize(
  device: Device,
  context: Context = Context.empty()
): Predicate<Element> {
  return function isClipped(element: Element): boolean {
    // Gathering the required style properties.
    const style = Style.from(element, device, context);
    const x = style.computed("overflow-x").value.value;
    const y = style.computed("overflow-y").value.value;
    const width = style.computed("width").value;
    const height = style.computed("height").value;

    // Does the element always show a scrollbar, no matter whether there is
    // enough room in it to show the content?
    const hasNoScrollBar = x !== "scroll" && y !== "scroll";

    for (const [axis, overflow, dimension] of [
      ["width", x, width],
      ["height", y, height],
    ] as const) {
      // Is the element reduced to nothingness in this axis?
      if (overflow === "visible") {
        // The content overflows in this axis, go to next axis.
        continue;
      }

      if (element.box.some((box) => box[axis] === 0)) {
        // The element's box is squished in this axis.
        return true;
      }

      if (Numeric.isNumeric(dimension) && Numeric.isZero(dimension)) {
        // "dimension: 0%" or "dimension: 0px", nothing shows nor overflows
        return true;
      }

      if (hasNoScrollBar && (overflow === "clip" || overflow === "hidden")) {
        // There is no scrollbar in any axis, so we consider that 1px is
        // invisible.
        // Note that overflow==="auto" would create a scrollbar in this axis,
        // so we cannot only rely on hasNoScrollBar.

        if (element.box.some((box) => box[axis] <= 1)) {
          return true;
        }

        if (Length.isLength(dimension) && dimension.value <= 1) {
          // "dimension: 1px" and there is no scrollbar in the other axis
          // (nor in this axis, since the overflow doesn't create one)
          return true;
        }
      }
    }

    return false;
  };
}

/**
 * Checks if an element is fully indented out of its box.
 */
function isClippedByIndent(
  device: Device,
  context: Context
): Predicate<Element> {
  return function isClipped(element: Element): boolean {
    const style = Style.from(element, device, context);

    const x = style.computed("overflow-x").value.value;

    if (x === "hidden") {
      const { value: indent } = style.computed("text-indent");
      const { value: whitespace } = style.computed("white-space");

      if (LengthPercentage.isCalculated(indent)) {
        // We couldn't fully resolve the mix of length and percentage.
        // We just assume the element is not indented off-parent.
        return false;
      }

      if (indent.value < 0 || whitespace.value === "nowrap") {
        switch (indent.type) {
          case "percentage":
            if (abs(indent.value) >= 1) {
              return true;
            } else {
              break;
            }

          case "length":
            if (abs(indent.value) >= 999) {
              return true;
            } else {
              break;
            }
        }
      }
    }

    return false;
  };
}

/**
 * Checks if an element is fully masked by a clipping shape.
 */
function isClippedByMasking(
  device: Device,
  context: Context
): Predicate<Element> {
  return function isClipped(element: Element): boolean {
    const style = Style.from(element, device, context);

    const { value: clip } = style.computed("clip");

    return (
      clip.type === "shape" &&
      ((clip.shape.top.type === "length" &&
        clip.shape.top.equals(clip.shape.bottom)) ||
        (clip.shape.left.type === "length" &&
          clip.shape.left.equals(clip.shape.right)))
    );
  };
}

/**
 * Checks if an element is moved out of an ancestor which clips its content.
 *
 * @remarks
 * This requires layout information to detect boxes intersections.
 *
 * Since layout is only gathered on empty context, this does not accept a context
 * parameter.
 *
 * Scrollbars only allow to scroll to the bottom or right of the positioning
 * ancestor, not to its left or right. So content in the bottom-right quadrant
 * needs a specific treatment. Content out of it will be clip by anything other
 * than "visible"; content in it can also be scrolled to with "auto" or "scroll".
 */
function isClippedByMovingAway(device: Device): Predicate<Element> {
  return (element) => {
    const elementBox = element.box.getUnsafe();

    function isClippedBy(ancestor: Element) {
      const ancestorBox = ancestor.box.getUnsafe();

      if (elementBox.intersects(ancestorBox)) {
        // The boxes intersect, we see the intersection at least.
        // This doesn't handle corner cases of 1×1px intersections.
        return false;
      }

      const style = Style.from(ancestor, device);
      const x = style.computed("overflow-x").value.value;
      const y = style.computed("overflow-y").value.value;

      if (elementBox.right < ancestorBox.left && x !== "visible") {
        // The element is to the left, and clipped away.
        return true;
      }

      if (
        elementBox.left > ancestorBox.right &&
        (x === "clip" || x === "hidden")
      ) {
        // The element is to the right and cannot be scrolled to
        return true;
      }

      if (elementBox.bottom < ancestorBox.top && y !== "visible") {
        // The element is above, and clipped away.
        return true;
      }

      if (
        elementBox.top > ancestorBox.bottom &&
        (y === "clip" || y === "hidden")
      ) {
        // The element is below and cannot be scrolled to
        return true;
      }
    }

    let parent = getPositioningParent(element, device);
    while (parent.isSome()) {
      if (isClippedBy(parent.get())) {
        return true;
      }

      parent = getPositioningParent(parent.get(), device);
    }

    return false;
  };
}
