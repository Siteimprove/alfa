import { Cache } from "@siteimprove/alfa-cache";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Device } from "@siteimprove/alfa-device";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";

const { hasAttribute, isElement } = Element;
const { or, test, equals } = Predicate;
const { and } = Refinement;
const { hasComputedStyle } = Style;

/**
 * Check if an element is programmatically hidden.
 *
 * While this only uses Style properties, this is thematically related to
 * accessibility and aria-* attributes and therefore lives in alfa-aria.
 *
 * @public
 */
export function isProgrammaticallyHidden(
  device: Device,
  context: Context = Context.empty()
): Predicate<Element> {
  return or(
    hasComputedStyle(
      "visibility",
      (visibility) => visibility.value !== "visible",
      device,
      context
    ),
    hasHiddenAncestors(device, context)
  );
}

const cache = Cache.empty<Device, Cache<Context, Cache<Node, boolean>>>();

function hasHiddenAncestors(
  device: Device,
  context: Context = Context.empty()
): Predicate<Node> {
  return (node) =>
    cache
      .get(device, Cache.empty)
      .get(context, Cache.empty)
      .get(node, () =>
        test(
          or(
            // Either it is a programmatically hidden element
            and(
              isElement,
              or(
                hasComputedStyle(
                  "display",
                  ({ values: [outside] }) => outside.value === "none",
                  device,
                  context
                ),
                hasAttribute("aria-hidden", equals("true"))
              )
            ),
            // Or its parent is programmatically hidden
            (node: Node) =>
              node
                .parent({
                  flattened: true,
                  nested: true,
                })
                .some(hasHiddenAncestors(device, context))
          ),
          node
        )
      );
}
