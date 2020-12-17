import { Cache } from "@siteimprove/alfa-cache";
import { Color } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Text, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";

const { isElement } = Element;
const { isText } = Text;

const cache = Cache.empty<Device, Cache<Context, Cache<Node, boolean>>>();

export function isTransparent(
  device: Device,
  context: Context = Context.empty()
): Predicate<Node> {
  return function isTransparent(node): boolean {
    return cache
      .get(device, Cache.empty)
      .get(context, Cache.empty)
      .get(node, () => {
        if (
          isElement(node) &&
          Style.from(node, device, context)
            .computed("opacity")
            .some((opacity) => opacity.value === 0)
        ) {
          return true;
        }

        for (const parent of node.parent({ flattened: true })) {
          if (isText(node) && isElement(parent)) {
            return Style.from(parent, device, context)
              .computed("color")
              .some(
                (color) => color.type === "color" && Color.isTransparent(color)
              );
          }

          return isTransparent(parent);
        }

        return false;
      });
  };
}
