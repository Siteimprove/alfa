import { Style } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function isTransparent(device: Device): Predicate<Node> {
  return node => {
    if (Element.isElement(node)) {
      const opacity = Style.from(node).computed("opacity");

      if (opacity.some(opacity => opacity.value !== 1)) {
        return true;
      }
    }

    return node.parent({ flattened: true }).some(isTransparent(device));
  };
}
