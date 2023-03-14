import { Cache } from "@siteimprove/alfa-cache";
import { Color } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node, Text } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Context } from "@siteimprove/alfa-selector";

import { hasComputedStyle } from "../../element/predicate/has-computed-style";

const { isElement } = Element;
const { isText } = Text;
const { or, and } = Refinement;

const cache = Cache.empty<Device, Cache<Context, Cache<Node, boolean>>>();

function isNotOpaque(device: Device, context: Context) {
  return hasComputedStyle(
    "opacity",
    (opacity) => opacity.value === 0,
    device,
    context
  );
}

function hasTransparentParent(device: Device, context: Context) {
  return (node: Node<string>) =>
    node
      .parent(Node.flatTree)
      .some(
        or(
          and(
            isElement,
            hasComputedStyle("color", Color.isTransparent, device, context)
          ),
          isTransparent(device, context)
        )
      );
}

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
      .get(node, () =>
        or(
          and(isElement, isNotOpaque(device, context)),
          and(isText, hasTransparentParent(device, context))
        )(node)
      );
  };
}
