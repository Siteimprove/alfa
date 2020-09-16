import { Device } from "@siteimprove/alfa-device";
import { Element, Comment, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Style } from "@siteimprove/alfa-style";

export function isRendered(device: Device): Predicate<Node> {
  return (node) => {
    if (Element.isElement(node)) {
      const display = Style.from(node, device).computed("display").value;

      const [outside] = display;

      if (outside.value === "none") {
        return false;
      }
    }

    if (Comment.isComment(node)) {
      return false;
    }

    return node.parent({ flattened: true }).every(isRendered(device));
  };
}
