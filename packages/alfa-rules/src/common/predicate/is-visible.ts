import { Device } from "@siteimprove/alfa-device";
import { Element, Text, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";

import { isRendered } from "./is-rendered";
import { isTransparent } from "./is-transparent";

const { not } = Predicate;
const { and, or } = Refinement;
const { isElement } = Element;
const { isText } = Text;

export function isVisible(device: Device, context?: Context): Predicate<Node> {
  return and(
    isRendered(device, context),
    not(isTransparent(device, context)),
    not(and(or(isElement, isText), isClipped(device, context))),
    (node) => {
      if (Element.isElement(node)) {
        const visibility = Style.from(node, device, context).computed(
          "visibility"
        ).value;

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

function isClipped(
  device: Device,
  context?: Context
): Predicate<Element | Text> {
  return function isClipped(node) {
    if (Element.isElement(node)) {
      const style = Style.from(node, device, context);

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

    return node.parent({ flattened: true }).filter(isElement).some(isClipped);
  };
}
