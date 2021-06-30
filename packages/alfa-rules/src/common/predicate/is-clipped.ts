import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";

const { abs } = Math;
const { isElement } = Element;
const { or, test } = Predicate;

const cache = Cache.empty<Device, Cache<Context, Cache<Node, boolean>>>();

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
            isClippedBySize(device, context),
            isClippedByIndent(device, context),
            isClippedByMasking(device, context),
            (node) =>
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
): Predicate<Node> {
  return function isClipped(node): boolean {
    if (isElement(node)) {
      const style = Style.from(node, device, context);

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

            // technically, 1×1 elements are (possibly) visible since they
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
    }

    return false;
  };
}

/**
 * Checks if an element is fully indented out of screen.
 */
function isClippedByIndent(device: Device, context: Context): Predicate<Node> {
  return function isClipped(node: Node): boolean {
    if (isElement(node)) {
      const style = Style.from(node, device, context);

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
    }

    return false;
  };
}

/**
 * Checks if an element is fully masked by a clipping shape.
 */
function isClippedByMasking(device: Device, context: Context): Predicate<Node> {
  return function isClipped(node: Node): boolean {
    if (isElement(node)) {
      const style = Style.from(node, device, context);

      const { value: clip } = style.computed("clip");
      const { value: position } = style.computed("position");

      if (
        (position.value === "absolute" || position.value === "fixed") &&
        clip.type === "shape" &&
        ((clip.shape.top.type === "length" &&
          clip.shape.top.equals(clip.shape.bottom)) ||
          (clip.shape.left.type === "length" &&
            clip.shape.top.equals(clip.shape.right)))
      ) {
        return true;
      }
    }

    return false;
  };
}
