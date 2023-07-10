import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Rectangle } from "@siteimprove/alfa-rectangle";
import { Context } from "@siteimprove/alfa-selector";
import { Trilean } from "@siteimprove/alfa-trilean";

import { hasComputedStyle, hasPositioningParent } from "../../element/element";

import { Style } from "../../style";

const { hasBox, isElement } = Element;
const { abs } = Math;
const { and, or } = Predicate;

const cache = Cache.empty<Device, Cache<Context, Cache<Node, boolean>>>();

/**
 * @internal
 */
export function isOffscreen(
  device: Device,
  context: Context = Context.empty()
): Predicate<Node> {
  return function isOffscreen(node): boolean {
    return cache
      .get(device, Cache.empty)
      .get(context, Cache.empty)
      .get(node, () => {
        if (isElement(node)) {
          if (node.box.isSome() && context === Context.empty()) {
            return isOffscreenLayout(node, device);
          } else {
            const style = Style.from(node, device, context);

            const fallback = isOffscreenFallback(style);
            // If we couldn't find anything on the element itself, we need to
            // look on its ancestors.
            return fallback ?? node.parent(Node.flatTree).some(isOffscreen);
          }
        }

        return node.parent(Node.flatTree).some(isOffscreen);
      });
  };
}

/**
 * @remarks
 * We assume that the layout was gathered with an empty context and therefore
 * only use it for empty context. Non-empty context may bring content on screen,
 * typically "skip to content" links are only on screen when focused.
 *
 * @remarks
 * Content that is hidden to the left or top of the screen is fairly safe to
 * be assumed invisible. Content that is hidden to the right or bottom may
 * be scrolled to. We assume there is always a way to scroll to the bottom, but
 * we do search for explicit scroll bar on ancestors' overflow for right.
 */
function isOffscreenLayout(element: Element, device: Device): boolean {
  // By definition, the viewport top-left corner is (0, 0).
  // We assume that most elements are on screen and order tests to try and
  // avoid unnecessarily work.

  // At first, we check whether the element's box intersects an infinitely high
  // rectangle extending the viewport to the bottom.
  // If yes, then the element can be brought into viewport by vertical scrolling
  // which, we assume, is not restricted.
  const extendedViewport = Rectangle.of(0, 0, device.viewport.width, Infinity);

  if (element.box.some((box) => box.intersects(extendedViewport))) {
    return false;
  }

  // Next, we also extend the viewport infinitely to the right.
  // If the element's box does not intersect this, then the element is quite
  // surely out of viewport (to the left or to the top).
  const scrollableViewport = Rectangle.of(0, 0, Infinity, Infinity);

  if (element.box.none((box) => box.intersects(scrollableViewport))) {
    return true;
  }

  // At this point, the element can only be to the right of the viewport. We need
  // to see if some (positioning) ancestor creates a scrollbar **and** is itself
  // intersecting the (extended) viewport.
  // Note: there might a be another ancestor in the way that is clipping the
  // element away. This is handled by isClipped and is ignored here.
  if (hasPositioningParent(device, isOnscreenAndScrolling(device))(element)) {
    return false;
  }

  // The element wasn't itself intersecting the (extended) viewport, and we couldn't
  // find any ancestor creating a scrollbar. So the element is fully offscreen.
  return true;
}

const onscreenAndScrollingCache = Cache.empty<
  Device,
  Cache<Element, boolean>
>();

function isOnscreenAndScrolling(device: Device): Predicate<Element> {
  const extendedViewport = Rectangle.of(0, 0, device.viewport.width, Infinity);

  return function predicate(element): boolean {
    return onscreenAndScrollingCache.get(device, Cache.empty).get(element, () =>
      or(
        and(
          // Does the element intersect the extended viewport?
          hasBox((box) => box.intersects(extendedViewport)),
          // And does it create a scrollbar which can show the element?
          hasComputedStyle(
            "overflow-x",
            (overflow) =>
              ["auto", "scroll", "visible"].includes(overflow.value),
            device
          )
        ),
        hasPositioningParent(device, predicate)
      )(element)
    );
  };
}

/**
 * @remarks
 * We can't really detect if content is moved off-screen, due to the lack of
 * layout system.
 * Instead, we inspect a handful of properties that affect positioning. If their
 * value is "large enough", we consider this as an indication that the content
 * is actually off-screen.
 * Since pages are mostly vertical scrolling, and most of the languages we look
 * at are left-to-right, this is mostly accurate when content is moved to the
 * left. Content moved to the right may actually create horizontal scrolling.
 * Content moved to the top may still be on screen if the normal position would
 * be low enough on the page. We assume that the presence of a large negative
 * value is indication of the intention to move the content off-screen, and
 * that proper care has been taken to actually make it invisible. Aka we
 * consider that using "top: -9999px" to voluntarily move something from the
 * bottom of a long page to its top is enough madness that nobody does it…
 *
 * Content moved to the bottom simply creates scrolling on vertical pages and is
 * not considered here.
 */
function isOffscreenFallback(style: Style): Trilean {
  const { value: position } = style.computed("position");
  const { value: left } = style.computed("left");
  const { value: right } = style.computed("right");
  const { value: top } = style.computed("top");
  const { value: marginLeft } = style.computed("margin-left");

  // margin-left affects also statically positioned elements.
  // margin-left could possibly hide further sibling of the element
  // until a block container is found.
  // We ignore this for now, until it proves problematic.
  if (marginLeft.type === "length" && marginLeft.value <= -9999) {
    return true;
  }

  if (position.value !== "static") {
    for (const inset of [left, right]) {
      // A large move on the left or right hides the content.
      if (inset.type === "length" && abs(inset.value) >= 9999) {
        return true;
      }
    }

    // A large move above the top hides the content.
    if (top.type === "length" && top.value <= -9999) {
      return true;
    }

    // If the element is positioned, with normal margin and normal
    // inset, it is likely on screen, no matter where its parent is.
    // We might need to instead recurse to the offset parent. For now,
    // we'll ignore that case considering it unlikely.
    return false;
  }

  return undefined;
}
