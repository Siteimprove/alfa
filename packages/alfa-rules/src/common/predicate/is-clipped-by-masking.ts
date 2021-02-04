import { Device } from "@siteimprove/alfa-device";
import { Context } from "@siteimprove/alfa-selector";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Cache } from "@siteimprove/alfa-cache";
import isElement = Element.isElement;
import { Style } from "@siteimprove/alfa-style";

const cache = Cache.empty<Device, Cache<Context, Cache<Node, boolean>>>();

/**
 * Test if a node is clipped to 0 pixels by a clip CSS property
 */
export function isClippedByMasking(
  device: Device,
  context: Context = Context.empty()
): Predicate<Node> {
  return function isClipped(node: Node): boolean {
    return cache
      .get(device, Cache.empty)
      .get(context, Cache.empty)
      .get(node, () => {
        if (isElement(node)) {
          const style = Style.from(node, device, context);
          const { value: clip } = style.computed("clip");
          const { value: position } = style.computed("position");

          // If element is absolutely positioned, the clip rectangle is not "auto", and one of its dimension (horizontal/vertical)
          // has equals non-"auto" values, then the element is totally clipped (0 pixels height or width clipping).
          // This does not handle "auto" values in rect() since these depend on the box size which we don't currently have.
          // Additionally, it is assumed that rect(auto, 0px, auto, 0px) is unlikely to be used as clipping method…
          if (
            (position.value === "absolute" || position.value === "fixed") &&
            clip.type === "shape" &&
            ((clip.shape.top.type === "length" &&
              clip.shape.top.equals(clip.shape.bottom)) ||
              (clip.shape.left.type === "length" &&
                clip.shape.top.equals(clip.shape.right)))
          ) {
            return true;
          }
        }

        // go up the DOM tree to see if an ancestor has been fully clipped.
        return node.parent({ flattened: true, nested: true }).some(isClipped);
      });
  };
}
