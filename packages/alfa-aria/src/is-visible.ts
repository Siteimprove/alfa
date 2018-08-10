import {
  Element,
  getAttribute,
  getComputedStyle,
  getParentElement,
  isElement,
  Node,
  Text
} from "@siteimprove/alfa-dom";

export function isVisible(node: Element | Text, context: Node): boolean {
  if (isElement(node)) {
    if (getAttribute(node, "aria-hidden") === "true") {
      return false;
    }

    const { display, visibility } = getComputedStyle(node, context);

    if (display === "none") {
      return false;
    }

    if (visibility === "hidden" || visibility === "collapse") {
      return false;
    }
  }

  const parentElement = getParentElement(node, context, { flattened: true });

  if (parentElement !== null) {
    return isVisible(parentElement, context);
  }

  return true;
}
