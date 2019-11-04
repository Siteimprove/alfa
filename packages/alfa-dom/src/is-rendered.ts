import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";

import { getParentElement } from "./get-parent-element";
import { getPropertyValue } from "./get-property-value";
import { getCascadedStyle } from "./get-style";
import { isElement, isText } from "./guards";
import { traverseNode } from "./traverse-node";
import { Element, Node, Text } from "./types";

const renders = Cache.empty<Node, Cache<Device, Cache<Element, boolean>>>();

/**
 * Given an element and a context, check if the element is being rendered
 * within the context. An element is considered as being rendered if it
 * generates layout boxes.
 *
 * @see https://html.spec.whatwg.org/#being-rendered
 *
 * @todo Handle `display: contents` once it gains wider support.
 *
 * @example
 * const span = <span />;
 * isRendered(span, <div style="display: none">{span}</div>, device);
 * // => false
 */
export function isRendered(
  node: Element | Text,
  context: Node,
  device: Device
): boolean {
  if (isText(node)) {
    return getParentElement(node, context, { flattened: true })
      .map(parentElement => isRendered(parentElement, context, device))
      .getOr(false);
  }

  return renders
    .get(context, Cache.empty)
    .get(device, () => {
      const renders = Cache.empty<Element, boolean>();

      return renders.merge(
        traverseNode(
          context,
          context,
          {
            *enter(node, parentNode) {
              if (isElement(node)) {
                const display = getPropertyValue(
                  getCascadedStyle(node, context, device),
                  "display"
                );

                if (display.isSome() && display.get().value === "none") {
                  yield [node, false];
                } else if (parentNode !== null && isElement(parentNode)) {
                  const isParentRendered = renders.get(parentNode);

                  if (isParentRendered.includes(false)) {
                    yield [node, false];
                  }
                }
              }
            }
          },
          { flattened: true, nested: true }
        )
      );
    })
    .get(node, () => true);
}
