import { indexOf } from "@siteimprove/alfa-util";
import { getParentNode } from "./get-parent-node";
import { Node } from "./types";

/**
 * @see https://www.w3.org/TR/dom/#dom-node-previoussibling
 */
export function getPreviousSibling<T extends Node>(
  node: Node,
  context: Node
): Node | null {
  const parentNode = getParentNode(node, context);

  if (parentNode === null) {
    return null;
  }

  const { childNodes } = parentNode;

  const previousIndex = indexOf(childNodes, node) - 1;

  if (previousIndex in childNodes) {
    return childNodes[previousIndex];
  }

  return null;
}
