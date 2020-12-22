import { Device } from "@siteimprove/alfa-device";
import { Element, Text, Node } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";

import { isRendered } from "./is-rendered";
import { isTransparent } from "./is-transparent";
import { Cache } from "@siteimprove/alfa-cache";
const { every } = Iterable;

const { not } = Predicate;
const { and, or } = Refinement;
const { isElement, hasName } = Element;
const { isText } = Text;

export function isVisible(device: Device, context?: Context): Predicate<Node> {
  return and(
    isRendered(device, context),
    not(isTransparent(device, context)),
    not(and(or(isElement, isText), isClipped(device, context))),
    (node) => {
      if (
        Element.isElement(node) &&
        Style.from(node, device, context)
          .computed("visibility")
          .some((visibility) => visibility.value !== "visible")
      ) {
        return false;
      }

      if (Text.isText(node)) {
        return node.data.trim() !== "";
      }

      return true;
    },
    // most non-replaced elements with no visible child are not visible
    // replaced elements are assumed to be replaced by something visible
    // some non-replaced elements are still visible when they are empty :-/
    not(
      and(
        isElement,
        and(not(or(isReplaced, isVisibleWhenEmpty)), (element) =>
          every(
            element.children({ nested: true, flattened: true }),
            not(isVisible(device, context))
          )
        )
      )
    )
  );
}

const clippedCache = Cache.empty<
  Device,
  Cache<Context, Cache<Node, boolean>>
>();

function isClipped(
  device: Device,
  context: Context = Context.empty()
): Predicate<Element | Text> {
  return function isClipped(node) {
    return clippedCache
      .get(device, Cache.empty)
      .get(context, Cache.empty)
      .get(node, () => {
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
      });
  };
}

/**
 * @see https://html.spec.whatwg.org/#replaced-elements
 */
const isReplaced = hasName(
  "audio",
  "canvas",
  "embed",
  "iframe",
  "img",
  "input",
  "object",
  "video"
);

/**
 * Elements that are *not* "replaced elements" but are nonetheless visible when empty
 */
const isVisibleWhenEmpty = hasName("textarea");
