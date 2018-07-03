import { indexOf } from "@siteimprove/alfa-util";
import { getParentNode } from "./get-parent-node";
import { Node } from "./types";

/**
 * @see https://www.w3.org/TR/dom/#dom-node-nextsibling
 */
export function getNextSibling<T extends Node>(
  node: Node,
  context: Node
): Node | null {
  const parentNode = getParentNode(node, context);

  if (parentNode === null) {
    return null;
  }

  const { childNodes } = parentNode;

  const nextIndex = indexOf(childNodes, node) + 1;

  if (nextIndex in childNodes) {
    return childNodes[nextIndex];
  }

  return null;
}
