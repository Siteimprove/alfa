import { Device } from "@siteimprove/alfa-device";
import { getParentElement } from "./get-parent-element";
import { getPropertyValue } from "./get-property-value";
import { getCascadedStyle } from "./get-style";
import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";
import { Element, Node, Text } from "./types";

type RenderedMap = WeakMap<Element, boolean>;

const renderedMaps = new WeakMap<Node, RenderedMap>();

/**
 * Given an element and a context, check if the element is being rendered
 * within the context. An element is considered as being rendered if it
 * generates layout boxes.
 *
 * @see https://www.w3.org/TR/html/rendering.html#being-rendered
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
  let renderedMap = renderedMaps.get(context);

  if (renderedMap === undefined) {
    renderedMap = new WeakMap();

    traverseNode(
      context,
      context,
      {
        enter(node, parentNode) {
          if (isElement(node)) {
            const display = getPropertyValue(
              getCascadedStyle(node, context, device),
              "display"
            );

            if (display !== null && display.value === "none") {
              renderedMap!.set(node, false);
            } else if (parentNode !== null && isElement(parentNode)) {
              const isParentRendered = renderedMap!.get(parentNode);

              if (isParentRendered === false) {
                renderedMap!.set(node, false);
              }
            }
          }
        }
      },
      { flattened: true, nested: true }
    );

    renderedMaps.set(context, renderedMap);
  }

  if (isElement(node)) {
    return renderedMap.get(node) !== false;
  }

  const parentElement = getParentElement(node, context, { flattened: true });

  if (parentElement !== null) {
    return renderedMap.get(parentElement) !== false;
  }

  return true;
}
