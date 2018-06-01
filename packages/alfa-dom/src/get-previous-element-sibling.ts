import { indexOf } from "@siteimprove/alfa-util";
import { Node, Element } from "./types";
import { isElement } from "./guards";
import { getParentNode } from "./get-parent-node";

/**
 * @see https://www.w3.org/TR/dom/#dom-nondocumenttypechildnode-previouselementsibling
 */
export function getPreviousElementSibling<T extends Node>(
  node: Node,
  context: Node
): Element | null {
  const parentNode = getParentNode(node, context);

  if (parentNode === null) {
    return null;
  }

  const { childNodes } = parentNode;

  for (let i = indexOf(childNodes, node) - 1; i >= 0; i--) {
    const sibling = childNodes[i];

    if (isElement(sibling)) {
      return sibling;
    }
  }

  return null;
}
