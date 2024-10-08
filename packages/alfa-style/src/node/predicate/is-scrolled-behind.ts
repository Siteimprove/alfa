import { Cache } from "@siteimprove/alfa-cache";
import type { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Rectangle } from "@siteimprove/alfa-rectangle";

import {
  hasComputedStyle,
  hasPositioningParent,
} from "../../element/element.js";
import type { Longhands } from "../../longhands.js";

const { isElement, hasBox } = Element;
const { and, or, not } = Predicate;

const cache = Cache.empty<Device, Cache<Node, boolean>>();

/**
 * Checks if content is not visible due to being scrolled behind a parent scroll container
 * {@link https://developer.mozilla.org/en-US/docs/Glossary/Scroll_container}
 *
 * @remarks
 * This predicate is currently not able to detect if content is scrolled behind to the left
 * or above after the scroll position has changed. This is because we would have to differentiate
 * between content that is to the left or above when the scroll position is in its default position
 * and therefore cannot be scrolled into view, and content that is to the left or above after scrolling
 * and could be scrolled back into view.
 *
 * Usually content that can be scrolled into view is considered visible,
 * but in some instances we also want to regard such content as invisible.
 * To check for this, use (the negation of) this predicate
 * in conjunction with isVisible like in the following example.
 *
 * @example
 * const isStrictlyVisible = and(isVisible, not(isScrolledBehind));
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
  overflow: Longhands.Computed<"overflow-x"> | Longhands.Computed<"overflow-y">,
): boolean => overflow.value === "scroll" || overflow.value === "auto";

function isScrollContainerFor(
  elementBox: Rectangle,
  device: Device,
): Predicate<Element> {
  return function isScrollContainerFor(ancestor): boolean {
    return or(
      and(
        // Element is in the scroll port, so it's not completely scrolled behind
        not(
          hasBox((ancestorBox) => ancestorBox.intersects(elementBox), device),
        ),
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
                  ancestorBox.right,
                  ancestorBox.top,
                  Infinity,
                  ancestorBox.height,
                ).intersects(elementBox),
              device,
            ),
            hasComputedStyle("overflow-x", isScrollOrAuto, device),
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
                  ancestorBox.left,
                  ancestorBox.bottom,
                  ancestorBox.width,
                  Infinity,
                ).intersects(elementBox),
              device,
            ),
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
                  ancestorBox.right,
                  ancestorBox.bottom,
                  Infinity,
                  Infinity,
                ).intersects(elementBox),
              device,
            ),
            hasComputedStyle("overflow-x", isScrollOrAuto, device),
            hasComputedStyle("overflow-y", isScrollOrAuto, device),
          ),
        ),
      ),
      // Element is not scrolled behind this container,
      // but it might be scrolled behind one of the containers ancestors.
      hasPositioningParent(device, isScrollContainerFor),
    )(ancestor);
  };
}
