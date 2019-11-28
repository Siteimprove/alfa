import { Style } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function isRendered(device: Device): Predicate<Node> {
  return node => {
    if (Element.isElement(node)) {
      const display = Style.from(node).cascaded("display");

      if (display.isSome()) {
        const [outside] = display.get().value;

        if (outside.value === "none") {
          return false;
        }
      }
    }

    return node.parent({ flattened: true }).every(isRendered(device));
  };
}
