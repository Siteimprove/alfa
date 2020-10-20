import { Device } from "@siteimprove/alfa-device";
import { Element, Comment, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";

const { isElement, hasName } = Element;

/**
 * @see https://html.spec.whatwg.org/#being-rendered
 */
export function isRendered(device: Device, context?: Context): Predicate<Node> {
  return function isRendered(node) {
    // Children of <iframe> elements act as fallback content in legacy user
    // agents and should therefore never be considered rendered.
    if (node.parent().filter(isElement).some(hasName("iframe"))) {
      return false;
    }

    if (Element.isElement(node)) {
      const display = Style.from(node, device, context).computed("display")
        .value;

      const [outside] = display;

      if (outside.value === "none") {
        return false;
      }
    }

    if (Comment.isComment(node)) {
      return false;
    }

    return node.parent({ flattened: true }).every(isRendered);
  };
}
