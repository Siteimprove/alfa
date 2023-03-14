import { Cache } from "@siteimprove/alfa-cache";
import { Color } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node, Text } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Context } from "@siteimprove/alfa-selector";

import { hasComputedStyle } from "../../element/predicate/has-computed-style";

const { isElement } = Element;
const { isText } = Text;

const cache = Cache.empty<Device, Cache<Context, Cache<Node, boolean>>>();

/**
 * @internal
 */
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
          hasComputedStyle(
            "opacity",
            (opacity) => opacity.value === 0,
            device,
            context
          )(node)
        ) {
          return true;
        }

        for (const parent of node.parent(Node.flatTree)) {
          if (
            isText(node) &&
            isElement(parent) &&
            hasComputedStyle(
              "color",
              Color.isTransparent,
              device,
              context
            )(parent)
          ) {
            return true;
          }

          return isTransparent(parent);
        }

        return false;
      });
  };
}
