import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Element, Text, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";

const { abs } = Math;
const { isElement } = Element;
const { or, test } = Predicate;
const { isText } = Text;

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
            isClippedByMasking(device, context)
          ),
          node
        )
      );
}

function isClippedBySize(
  device: Device,
  context: Context = Context.empty()
): Predicate<Node> {
  return function isClipped(node): boolean {
    if (isElement(node)) {
      const style = Style.from(node, device, context);

      const { value: height } = style.computed("height");
      const { value: width } = style.computed("width");
      const { value: x } = style.computed("overflow-x");
      const { value: y } = style.computed("overflow-y");

      if (
        height.type !== "keyword" &&
        height.value <= 1 &&
        width.type !== "keyword" &&
        width.value <= 1 &&
        x.value === "hidden" &&
        y.value === "hidden"
      ) {
        return true;
      }
    }

    for (const parent of node.parent({ flattened: true })) {
      if (isText(node) && isElement(parent)) {
        const style = Style.from(parent, device, context);

        const { value: x } = style.computed("overflow-x");

        if (x.value === "hidden") {
          const { value: indent } = style.computed("text-indent");
          const { value: whitespace } = style.computed("white-space");

          if (indent.value < 0 || whitespace.value === "nowrap") {
            switch (indent.type) {
              case "percentage":
                return abs(indent.value) >= 1;

              case "length":
                return abs(indent.value) >= 999;
            }
          }
        }
      }

      return isClipped(parent);
    }

    return false;
  };
}

function isClippedByMasking(device: Device, context: Context): Predicate<Node> {
  return function isClipped(node: Node): boolean {
    if (isElement(node)) {
      const style = Style.from(node, device, context);

      const { value: clip } = style.computed("clip");
      const { value: position } = style.computed("position");

      // If element is absolutely positioned, the clip rectangle is not "auto", and one of its dimension (horizontal/vertical)
      // has equals non-"auto" values, then the element is totally clipped (0 pixels height or width clipping).
      // This does not handle "auto" values in rect() since these depend on the box size which we don't currently have.
      // Additionally, it is assumed that rect(auto, 0px, auto, 0px) is unlikely to be used as clipping method…
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

    return node
      .parent({
        flattened: true,
        nested: true,
      })
      .some(isClipped);
  };
}
