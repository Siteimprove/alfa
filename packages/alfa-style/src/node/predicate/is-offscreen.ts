import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Context } from "@siteimprove/alfa-selector";

import { Style } from "../../style";

const { abs } = Math;
const { isElement } = Element;

const cache = Cache.empty<Device, Cache<Context, Cache<Node, boolean>>>();

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
 *
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
          const style = Style.from(node, device, context);

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
        }

        return node.parent(Node.flatTree).some(isOffscreen);
      });
  };
}
