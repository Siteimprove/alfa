import { indexOf } from "@siteimprove/alfa-util";
import { Node } from "./types";
import { getParentNode } from "./get-parent-node";

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

  return childNodes[indexOf(childNodes, node) + 1] || null;
}
