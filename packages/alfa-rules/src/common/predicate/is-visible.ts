import { Device } from "@siteimprove/alfa-device";
import { Element, Text, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";

import { isRendered } from "./is-rendered";
import { isTransparent } from "./is-transparent";
import { Iterable } from "@siteimprove/alfa-iterable";
import every = Iterable.every;

const { not, or } = Predicate;
const { and } = Refinement;
const { isElement } = Element;
const { isText } = Text;

export function isVisible(device: Device, context?: Context): Predicate<Node> {
  return and(
    isRendered(device, context),
    not(isTransparent(device, context)),
    // Text specific checks
    not(
      and(
        isText,
        // text which is empty or clipped is not visible
        or<Text>((text) => text.data.trim() === "", isClipped(device, context))
      )
    ),
    // Element specific checks
    not(
      and(
        isElement,
        or<Element>(
          // elements with visibility other than "visible" are not visible
          (element) =>
            Style.from(element, device, context)
              .computed("visibility")
              .some((visibility) => visibility.value !== "visible"),
          // clipped elements are not visible
          isClipped(device, context),
          // non-replaced elements with no visible child are not visible
          // replaced elements are assumed to be replaced by something visible.
          and(not(isReplaced), (element) =>
            every(
              element.children({ nested: true, flattened: true }),
              not(isVisible(device, context))
            )
          )
        )
      )
    )
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

    return node
      .parent({
        flattened: true,
      })
      .filter(isElement)
      .some(isClipped);
  };
}

/**
 * @see https://html.spec.whatwg.org/multipage/rendering.html#replaced-elements
 */
const isReplaced: Predicate<Element> = (element) =>
  [
    "audio",
    "canvas",
    "embed",
    "iframe",
    "img",
    "input",
    "object",
    "video",
  ].includes(element.name);
