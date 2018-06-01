import { indexOf } from "@siteimprove/alfa-util";
import { Node, Element } from "./types";
import { isElement } from "./guards";
import { getParentNode } from "./get-parent-node";

/**
 * @see https://www.w3.org/TR/dom/#dom-nondocumenttypechildnode-nextelementsibling
 */
export function getNextElementSibling<T extends Node>(
  node: Node,
  context: Node
): Element | null {
  const parentNode = getParentNode(node, context);

  if (parentNode === null) {
    return null;
  }

  const { childNodes } = parentNode;
  const { length } = childNodes;

  for (let i = indexOf(childNodes, node) + 1, n = length; i < n; i++) {
    const sibling = childNodes[i];

    if (isElement(sibling)) {
      return sibling;
    }
  }

  return null;
}
