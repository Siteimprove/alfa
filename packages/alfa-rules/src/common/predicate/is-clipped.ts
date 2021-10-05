import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";

const { abs } = Math;
const { isElement } = Element;
const { or, test } = Predicate;
const { and } = Refinement;

const cache = Cache.empty<Device, Cache<Context, Cache<Node, boolean>>>();

/**
 * Checks if a node (or one of its ancestor) is fully clipped
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
            // Either it a clipped element
            and(
              isElement,
              or(
                isClippedBySize(device, context),
                isClippedByIndent(device, context),
                isClippedByMasking(device, context)
              )
            ),
            // Or its parent is clipped
            (node: Node) =>
              node
                .parent({
                  flattened: true,
                  nested: true,
                })
                .some(isClipped(device, context))
          ),
          node
        )
      );
}

/**
 * Checks if an element's size is reduced to 0 or 1 pixel, and overflow is
 * somehow hidden.
 */
function isClippedBySize(
  device: Device,
  context: Context = Context.empty()
): Predicate<Element> {
  return function isClipped(element: Element): boolean {
    const style = Style.from(element, device, context);

    const {
      value: { value: x },
    } = style.computed("overflow-x");
    const {
      value: { value: y },
    } = style.computed("overflow-y");

    const { value: height } = style.computed("height");
    const { value: width } = style.computed("width");

    const hasNoScrollBar = x === "hidden" || y === "hidden";

    if (x !== "visible" || y !== "visible") {
      for (const dimension of [height, width]) {
        switch (dimension.type) {
          case "percentage":
            if (dimension.value <= 0) {
              return true;
            } else {
              break;
            }

          // Technically, 1×1 elements are (possibly) visible since they
          // show one pixel of background. We assume this is used to hide
          // elements and that the background is the same as the surrounding
          // one.
          case "length":
            if (dimension.value <= (hasNoScrollBar ? 1 : 0)) {
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
          clip.shape.top.equals(clip.shape.right)))
    );
  };
}
