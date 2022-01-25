import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Element, Comment, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";
import { Text } from "@siteimprove/alfa-dom";
import { isFallback } from "../predicate";
import { Refinement } from "@siteimprove/alfa-refinement";

const cache = Cache.empty<Device, Cache<Context, Cache<Node, boolean>>>();
const { isText } = Text;
const { and } = Refinement;
const { isElement, hasName } = Element;
/**
 * {@link https://html.spec.whatwg.org/#being-rendered}
 */
export function isRendered(
  device: Device,
  context: Context = Context.empty()
): Predicate<Node> {
  return function isRendered(node): boolean {
    return cache
      .get(device, Cache.empty)
      .get(context, Cache.empty)
      .get(node, () => {
        if (isFallback(node)) {
          return false;
        }

        if (
          Element.isElement(node) &&
          Style.from(node, device, context)
            .computed("display")
            .some(({ values: [outside] }) => outside.value === "none")
        ) {
          return false;
        }

        if (Comment.isComment(node)) {
          return false;
        }

        return node
          .parent({
            flattened: true,
            nested: true,
          })
          .every(isRendered);
      });
  };
}
