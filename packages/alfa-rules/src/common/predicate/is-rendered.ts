import { Device } from "@siteimprove/alfa-device";
import { Element, Comment, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Style } from "@siteimprove/alfa-style";

import { hasName } from "@siteimprove/alfa-dom/src/node/element/predicate/has-name";
const { and } = Predicate;

export function isRendered(device: Device): Predicate<Node> {
  return (node) => {
    // descendants of iframe are not rendered, they are fallback content for legacy browsers…
    // @see https://html.spec.whatwg.org/multipage/iframe-embed-object.html#the-iframe-element

    if (node.ancestors().some(and(Element.isElement, hasName("iframe")))) {
      return false;
    }

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
