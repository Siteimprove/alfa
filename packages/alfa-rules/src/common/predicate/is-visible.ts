import { Device } from "@siteimprove/alfa-device";
import { Element, Text, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Style } from "@siteimprove/alfa-style";

import { isRendered } from "./is-rendered";
import { isTransparent } from "./is-transparent";

const { and, or, not } = Predicate;
const { isElement } = Element;
const { isText } = Text;

export function isVisible(device: Device): Predicate<Node> {
  return and(
    isRendered(device),
    not(isTransparent(device)),
    not(and(or(isElement, isText), isClipped(device))),
    (node) => {
      if (Element.isElement(node)) {
        const visibility = Style.from(node, device).computed("visibility")
          .value;

        if (visibility.value !== "visible") {
          return false;
        }
      }

      if (Text.isText(node)) {
        return node.data.trim() !== "";
      }

      return true;
    }
  );
}

function isClipped(device: Device): Predicate<Element | Text> {
  return function isClipped(node): boolean {
    if (Element.isElement(node)) {
      const style = Style.from(node, device);

      const { value: height } = style.computed("height");
      const { value: width } = style.computed("width");
      const { value: x } = style.computed("overflow-x");
      const { value: y } = style.computed("overflow-y");

      if (
        height.type === "length" &&
        height.value <= 1 &&
        width.type === "length" &&
        height.value <= 1 &&
        x.value === "hidden" &&
        y.value === "hidden"
      ) {
        return true;
      }
    }

    for (const parent of node.parent({ flattened: true })) {
      if (Element.isElement(parent)) {
        return isClipped(parent);
      }
    }

    return false;
  };
}
