import { Device } from "@siteimprove/alfa-device";
import {
  Element,
  getAttribute,
  getCascadedStyle,
  getParentElement,
  isElement,
  Node,
  Text
} from "@siteimprove/alfa-dom";

export function isVisible(
  node: Element | Text,
  context: Node,
  device: Device
): boolean {
  if (isElement(node)) {
    if (getAttribute(node, "aria-hidden") === "true") {
      return false;
    }

    const { display, visibility } = getCascadedStyle(node, context, device);

    if (display !== undefined && display.value === "none") {
      return false;
    }

    if (visibility !== undefined) {
      if (visibility.value === "hidden" || visibility.value === "collapse") {
        return false;
      }
    }
  }

  const parentElement = getParentElement(node, context, { flattened: true });

  if (parentElement !== null) {
    return isVisible(parentElement, context, device);
  }

  return true;
}
