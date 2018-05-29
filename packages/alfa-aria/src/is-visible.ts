import {
  Node,
  Element,
  Text,
  isElement,
  getAttribute,
  getComputedStyle,
  getParentNode
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
      let next: Node | null = node;
      next !== null && isElement(next);
      next = getParentNode(next, context)
    ) {
      const { display } = getComputedStyle(next, context);

      if (display !== undefined && "box" in display && display.box === "none") {
        return false;
      }
    }
  } else {
    const parentNode = getParentNode(node, context);

    if (parentNode !== null && isElement(parentNode)) {
      return isVisible(parentNode, context);
    }
  }

  return true;
}
