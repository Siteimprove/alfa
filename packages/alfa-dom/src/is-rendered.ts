import { Device } from "@siteimprove/alfa-device";
import { Cache } from "@siteimprove/alfa-util";
import { getParentElement } from "./get-parent-element";
import { getPropertyValue } from "./get-property-value";
import { getCascadedStyle } from "./get-style";
import { isElement, isText } from "./guards";
import { traverseNode } from "./traverse-node";
import { Element, Node, Text } from "./types";

const renders = Cache.of<Node, Cache<Device, Cache<Element, boolean>>>();

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
    const parentElement = getParentElement(node, context, { flattened: true });

    if (parentElement === null) {
      return false;
    }

    node = parentElement;
  }

  return renders
    .get(context, Cache.of)
    .get(device, () => {
      const renders = Cache.of<Element, boolean>();

      [
        ...traverseNode(
          context,
          context,
          {
            *enter(node, parentNode) {
              if (isElement(node)) {
                const display = getPropertyValue(
                  getCascadedStyle(node, context, device),
                  "display"
                );

                if (display !== null && display.value === "none") {
                  renders.set(node, false);
                } else if (parentNode !== null && isElement(parentNode)) {
                  const isParentRendered = renders.get(parentNode);

                  if (isParentRendered === false) {
                    renders.set(node, false);
                  }
                }
              }
            }
          },
          { flattened: true, nested: true }
        )
      ];

      return renders;
    })
    .get(node, () => true);
}
