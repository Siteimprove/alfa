import { Cache } from "@siteimprove/alfa-cache";
import type { Device } from "@siteimprove/alfa-device";
import { Element, Comment, Node } from "@siteimprove/alfa-dom";
import type { Predicate } from "@siteimprove/alfa-predicate";
import { Context } from "@siteimprove/alfa-selector";

import { Style } from "../../style.js";

const { isFallback } = Element;

const cache = Cache.empty<Device, Cache<Context, Cache<Node, boolean>>>();

/**
 * {@link https://html.spec.whatwg.org/multipage/#being-rendered}
 *
 * @public
 */
export function isRendered(
  device: Device,
  context: Context = Context.empty(),
): Predicate<Node> {
  return function isRendered(node): boolean {
    return cache
      .get(device, Cache.empty)
      .get(context, Cache.empty)
      .get(node, () => {
        // Nodes that are fallback content for legacy browsers are not
        // being rendered (on modern browsers).
        if (isFallback(node)) {
          return false;
        }

        // Elements with `display: none` are not being rendered
        if (
          Element.isElement(node) &&
          Style.from(node, device, context)
            .computed("display")
            .some(({ values: [outside] }) => outside.value === "none")
        ) {
          return false;
        }

        // Comments are never being rendered
        if (Comment.isComment(node)) {
          return false;
        }

        return node.parent(Node.fullTree).every(isRendered);
      });
  };
}
