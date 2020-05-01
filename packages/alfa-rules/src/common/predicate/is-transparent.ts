import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Style } from "@siteimprove/alfa-style";

export function isTransparent(device: Device): Predicate<Node> {
  return (node) => {
    if (Element.isElement(node)) {
      const opacity = Style.from(node, device).computed("opacity").value;

      if (opacity.value === 0) {
        return true;
      }
    }

    return node.parent({ flattened: true }).some(isTransparent(device));
  };
}
