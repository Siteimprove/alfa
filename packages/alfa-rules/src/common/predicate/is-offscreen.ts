import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";

const { abs } = Math;
const { isElement } = Element;

const cache = Cache.empty<Device, Cache<Context, Cache<Node, boolean>>>();

export function isOffscreen(
  device: Device,
  context: Context = Context.empty()
): Predicate<Node> {
  return function isOffscreen(node) {
    return cache
      .get(device, Cache.empty)
      .get(context, Cache.empty)
      .get(node, () => {
        if (isElement(node)) {
          const style = Style.from(node, device, context);

          const { value: position } = style.computed("position");
          const { value: left } = style.computed("left");
          const { value: right } = style.computed("right");

          if (position.value !== "static") {
            for (const inset of [left, right]) {
              switch (inset.type) {
                case "length":
                  return abs(inset.value) >= 9999;
              }
            }
          }
        }

        return node
          .parent({
            flattened: true,
          })
          .some(isOffscreen);
      });
  };
}
