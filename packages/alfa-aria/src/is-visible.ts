import {
  Element,
  getAttribute,
  getComputedStyle,
  getParentElement,
  isElement,
  isRendered,
  Node,
  Text
} from "@siteimprove/alfa-dom";

export function isVisible(node: Element | Text, context: Node): boolean {
  if (isElement(node)) {
    if (getAttribute(node, "aria-hidden") === "true") {
      return false;
    }

    let parent = getParentElement(node, context);
    while (parent !== null) {
      if (getAttribute(parent, "aria-hidden") === "true") {
        return false;
      }

      parent = getParentElement(parent, context);
    }

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
