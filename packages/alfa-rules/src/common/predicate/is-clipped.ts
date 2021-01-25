import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Element, Text, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";

const { abs } = Math;
const { isElement } = Element;
const { isText } = Text;

const cache = Cache.empty<Device, Cache<Context, Cache<Node, boolean>>>();

export function isClipped(
  device: Device,
  context: Context = Context.empty()
): Predicate<Node> {
  return function isClipped(node): boolean {
    return cache
      .get(device, Cache.empty)
      .get(context, Cache.empty)
      .get(node, () => {
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
            const { value: y } = style.computed("overflow-y");
            const { value: whitespace } = style.computed("white-space");

            if (
              x.value === "hidden" &&
              y.value === "hidden" &&
              whitespace.value === "nowrap"
            ) {
              const { value: indent } = style.computed("text-indent");

              switch (indent.type) {
                case "percentage":
                  return abs(indent.value) >= 1;

                case "length":
                  return abs(indent.value) >= 999;
              }
            }
          }

          return isClipped(parent);
        }

        return false;
      });
  };
}
