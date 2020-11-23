import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";

const cache = Cache.empty<Device, Cache<Context, Cache<Node, boolean>>>();

export function isTransparent(
  device: Device,
  context: Context = Context.empty()
): Predicate<Node> {
  return function isTransparent(node) {
    return cache
      .get(device, Cache.empty)
      .get(context, Cache.empty)
      .get(node, () => {
        if (
          Element.isElement(node) &&
          Style.from(node, device, context)
            .computed("opacity")
            .some((opacity) => opacity.value === 0)
        ) {
          return true;
        }

        return node
          .parent({
            flattened: true,
          })
          .some(isTransparent);
      });
  };
}
