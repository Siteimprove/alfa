import { Cache } from "@siteimprove/alfa-cache";
import { LengthPercentage } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Context } from "@siteimprove/alfa-selector";

import { Style } from "../../style";
import { hasPositioningParent } from "../../element/predicate/has-positioning-parent";

const { abs } = Math;
const { isElement } = Element;
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
 * @remarks
 * Most clipping techniques reduce both axis to 0 or 1 px, not just one. This, on
 * overall, tends to make this check a bit more robust.
 *
 * @remarks
 * Clipping occurs at the border, thus including the padding. It is possible
 * for an element to clip overflow, and have a width/height of 0, yet still show
 * content in its padding area. This should probably also look into padding size.
 * So far, we haven't encountered problem due to that. Presumably, content that
 * is meant to be clipped is correctly put in elements without padding, and the
 * incorrect clipping would be easily detected by visual regression test early on.
 *
 * @remarks
 * The boxes we get with getBoundingClientRect include padding (and border).
 * Thus, when these boxes have width/height of 0 and the content is clipped, we
 * are fairly sure that nothing shows.
 *
 * @remarks
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
    const hasScrollBar = x === "scroll" || y === "scroll";

    // Is the element reduced to nothingness in the horizontal axis?
    switch (x) {
      case "visible":
        // The horizontal overflow is visible
        break;
      case "clip":
      case "hidden":
        // The horizontal overflow is clipped, is the element small enough to
        // be considered invisible?
        if (width.type === "percentage" && width.value <= 0) {
          // width: 0%
          return true;
        }
        if (width.type === "length" && width.value <= (hasScrollBar ? 0 : 1)) {
          // "width: 0px" (and no vertical scrollbar) or "width: 1px"
          return true;
        }
        break;
      case "auto":
      case "scroll":
        // The horizontal overflow creates a scrollbar, is the element small
        // enough to hide it anyway?
        if (width.type !== "keyword" && width.value <= 0) {
          return true;
        }
        break;
    }

    // Is the element reduced to nothingness in the vertical axis?
    switch (y) {
      case "visible":
        // The vertical overflow is visible
        break;
      case "clip":
      case "hidden":
        // The vertical overflow is clipped, is the element small enough to
        // be considered invisible?
        if (height.type === "percentage" && height.value <= 0) {
          // height: 0%
          return true;
        }
        if (
          height.type === "length" &&
          height.value <= (hasScrollBar ? 0 : 1)
        ) {
          // "height: 0px" (and no horizontal scrollbar) or "height: 1px"
          return true;
        }
        break;
      case "auto":
      case "scroll":
        // The vertical overflow creates a scrollbar, is the element small
        // enough to hide it anyway?
        if (height.type !== "keyword" && height.value <= 0) {
          return true;
        }
        break;
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

    const { value: x } = style.computed("overflow-x");

    if (x.value === "hidden") {
      const { value: indent } = style.computed("text-indent");
      const { value: whitespace } = style.computed("white-space");

      if (LengthPercentage.isCalculated(indent)) {
        // We couldn't fully resolve the mix of length and percentage.
        // We just assume the element is not indented off-screen.
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
