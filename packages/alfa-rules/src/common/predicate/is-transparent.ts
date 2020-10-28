import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";

export function isTransparent(
  device: Device,
  context?: Context
): Predicate<Node> {
  return function isTransparent(node) {
    if (Element.isElement(node)) {
      if (
        Style.from(node, device, context)
          .computed("opacity")
          .some((opacity) => opacity.value === 0)
      ) {
        return true;
      }
    }

    return node.parent({ flattened: true }).some(isTransparent);
  };
}
