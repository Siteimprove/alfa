import {
  Node,
  Element,
  Text,
  isElement,
  getAttribute,
  getComputedStyle,
  getParentElement
} from "@siteimprove/alfa-dom";

export function isVisible(node: Element | Text, context: Node): boolean {
  if (isElement(node)) {
    if (getAttribute(node, "aria-hidden") === "true") {
      return false;
    }

    const { visibility } = getComputedStyle(node, context);

    if (visibility === "hidden" || visibility === "collapse") {
      return false;
    }

    for (
      let next: Element | null = node;
      next !== null;
      next = getParentElement(next, context)
    ) {
      const { display } = getComputedStyle(next, context);

      if (display !== undefined && "box" in display && display.box === "none") {
        return false;
      }
    }
  } else {
    const parentElement = getParentElement(node, context);

    if (parentElement !== null) {
      return isVisible(parentElement, context);
    }
  }

  return true;
}
