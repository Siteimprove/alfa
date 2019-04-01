import { Device } from "@siteimprove/alfa-device";
import { getParentElement } from "./get-parent-element";
import { getCascadedStyle } from "./get-style";
import { isElement } from "./guards";
import { isRendered } from "./is-rendered";
import { Element, Node, Text } from "./types";

export function isVisible(
  node: Element | Text,
  context: Node,
  device: Device
): boolean {
  if (!isRendered(node, context, device)) {
    return false;
  }

  if (isElement(node)) {
    for (
      let next: Element | null = node;
      next !== null;
      next = getParentElement(next, context, { flattened: true })
    ) {
      const { opacity, visibility } = getCascadedStyle(next, context, device);

      if (opacity !== undefined && opacity.value === 0) {
        return false;
      }

      if (visibility !== undefined) {
        if (visibility.value === "hidden" || visibility.value === "collapse") {
          return false;
        }
      }
    }
  } else {
    const parentElement = getParentElement(node, context, { flattened: true });

    if (parentElement !== null) {
      return isVisible(parentElement, context, device);
    }
  }

  return true;
}
