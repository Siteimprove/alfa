import {
  Element,
  getAttribute,
  getClosest,
  getComputedStyle,
  getParentElement,
  isElement,
  isRendered,
  Node,
  Text
} from "@siteimprove/alfa-dom";

export function isVisible(node: Element | Text, context: Node): boolean {
  if (
    getClosest(
      node,
      context,
      node => isElement(node) && getAttribute(node, "aria-hidden") === "true",
      { flattened: true }
    ) !== null
  ) {
    return false;
  }

  if (isElement(node)) {
    const { visibility } = getComputedStyle(node, context);

    if (visibility === "hidden" || visibility === "collapse") {
      return false;
    }

    return isRendered(node, context);
  } else {
    const parentElement = getParentElement(node, context);

    if (parentElement !== null) {
      return isVisible(parentElement, context);
    }
  }

  return true;
}
