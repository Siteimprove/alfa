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

      const { value: x } = style.computed("overflow-x");
      const { value: y } = style.computed("overflow-y");

      if (x.value === "hidden" || y.value === "hidden") {
        const { value: height } = style.computed("height");
        const { value: width } = style.computed("width");

        for (const dimension of [height, width]) {
          switch (dimension.type) {
            case "percentage":
              if (dimension.value <= 0) {
                return true;
              } else {
                break;
              }

            case "length":
              if (dimension.value <= 1) {
                return true;
              } else {
                break;
              }
          }
        }
      }

      if (x.value === "auto" || y.value === "auto") {
        const { value: height } = style.computed("height");
        const { value: width } = style.computed("width");

        for (const dimension of [height, width]) {
          switch (dimension.type) {
            case "percentage":
              if (dimension.value <= 0) {
                return true;
              } else {
                break;
              }

            case "length":
              if (dimension.value <= 1) {
                return true;
              } else {
                break;
              }
          }
        }
      }

      if (x.value === "scroll" || y.value === "scroll") {
        const { value: height } = style.computed("height");
        const { value: width } = style.computed("width");

        for (const dimension of [height, width]) {
          switch (dimension.type) {
            case "percentage":
              if (dimension.value <= 0) {
                return true;
              } else {
                break;
              }

            case "length":
              if (dimension.value <= 1) {
                return true;
              } else {
                break;
              }
          }
        }
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
                if (abs(indent.value) >= 1) {
                  return true;
                }

              case "length":
                if (abs(indent.value) >= 999) {
                  return true;
                }
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
