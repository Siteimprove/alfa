import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Rectangle } from "@siteimprove/alfa-rectangle";

import { hasComputedStyle, hasPositioningParent } from "../../element/element";
import { Longhands } from "../..";

const { isElement, hasBox } = Element;
const { and, or, not } = Predicate;

const cache = Cache.empty<Device, Cache<Node, boolean>>();

/**
 * Checks if content is not visible due to being scrolled behind a parent scroll container
 * https://developer.mozilla.org/en-US/docs/Glossary/Scroll_container
 *
 * @public
 */
export function isScrolledBehind(device: Device): Predicate<Node> {
  return function isScrolledBehind(node): boolean {
    return cache.get(device, Cache.empty).get(node, () => {
      if (isElement(node)) {
        return hasBox(
          (elementBox) =>
            hasPositioningParent(
              device,
              or(
                // The parent, or one of it's ancestors, is scroll container for the element,
                isScrollContainerFor(elementBox, device),
                // or the parent itself is scrolled behind
                isScrolledBehind,
              ),
            )(node),
          device,
        )(node);
      } else {
        // Not an element, check the parent.
        return node.parent(Node.fullTree).some(isScrolledBehind);
      }
    });
  };
}

const isScrollOrAuto = (
  overflow:
    | Longhands.Specified<"overflow-x">
    | Longhands.Specified<"overflow-y">,
): boolean => overflow.value === "scroll" || overflow.value === "auto";

const isHidden = (
  overflow:
    | Longhands.Specified<"overflow-x">
    | Longhands.Specified<"overflow-y">,
): boolean => overflow.value === "hidden";

function isScrollContainerFor(
  elementBox: Rectangle,
  device: Device,
): Predicate<Element> {
  return function isScrollContainerFor(ancestor): boolean {
    return and(
      // Element is in the scroll port, so it's not completely scrolled behind
      not(hasBox((ancestorBox) => ancestorBox.intersects(elementBox), device)),
      or(
        // Element intersects the rectangle to the right stretching to infinity
        //
        //    +-------+-------- - -
        //    |       |  *
        //    |       |
        //    +-------+-------- - -
        //
        and(
          hasBox(
            (ancestorBox) =>
              Rectangle.of(
                ancestorBox.top,
                ancestorBox.right,
                Infinity,
                ancestorBox.height,
              ).intersects(elementBox),
            device,
          ),
          hasComputedStyle("overflow-x", isScrollOrAuto, device),
          hasComputedStyle("overflow-y", or(isScrollOrAuto, isHidden), device),
        ),
        // Element intersects the rectangle below stretching to infinity
        //
        //    +-------+
        //    |       |
        //    |       |
        //    +-------+
        //    |   *   |
        //    |       |
        //    .       .
        //    .       .
        and(
          hasBox(
            (ancestorBox) =>
              Rectangle.of(
                ancestorBox.bottom,
                ancestorBox.left,
                ancestorBox.width,
                Infinity,
              ).intersects(elementBox),
            device,
          ),
          hasComputedStyle("overflow-x", or(isScrollOrAuto, isHidden), device),
          hasComputedStyle("overflow-y", isScrollOrAuto, device),
        ),
        // Element intersects the rectangle to the right and below stretching to infinity
        //
        //    +-------+
        //    |       |
        //    |       |
        //    +-------+-------- - -
        //            |
        //            |   *
        //            .
        //            .
        and(
          hasBox(
            (ancestorBox) =>
              Rectangle.of(
                ancestorBox.bottom,
                ancestorBox.right,
                Infinity,
                Infinity,
              ).intersects(elementBox),
            device,
          ),
          hasComputedStyle("overflow-x", isScrollOrAuto, device),
          hasComputedStyle("overflow-y", isScrollOrAuto, device),
        ),
        // Element is not scrolled behind this container,
        // but it might be scrolled behind one of the containers ancestors.
        hasPositioningParent(device, isScrollContainerFor),
      ),
    )(ancestor);
  };
}
