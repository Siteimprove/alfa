import { Device } from "@siteimprove/alfa-device";
import { getParentElement } from "./get-parent-element";
import { getCascadedStyle } from "./get-style";
import { isElement } from "./guards";
import { Element, Node, Text } from "./types";

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
  if (isElement(node)) {
    for (
      let next: Element | null = node;
      next !== null;
      next = getParentElement(next, context, { flattened: true })
    ) {
      const { display } = getCascadedStyle(next, context, device);

      if (display !== undefined && display.value === "none") {
        return false;
      }
    }
  } else {
    const parentElement = getParentElement(node, context, { flattened: true });

    if (parentElement !== null) {
      return isRendered(parentElement, context, device);
    }
  }

  return true;
}
