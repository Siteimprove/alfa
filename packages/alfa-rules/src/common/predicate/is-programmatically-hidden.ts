import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Context } from "@siteimprove/alfa-selector";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Style } from "@siteimprove/alfa-style";

import { hasAttribute } from "../predicate";
import { hasComputedStyle } from "./has-computed-style";

const { and } = Refinement;
const { isElement } = Element;
const { or, test, equals } = Predicate;

const cache = Cache.empty<Device, Cache<Context, Cache<Node, boolean>>>();

export function hasHiddenAncestors(
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
                hasAttribute("hidden"),
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
