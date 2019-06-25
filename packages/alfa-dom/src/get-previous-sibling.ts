import { getParentNode } from "./get-parent-node";
import { Node } from "./types";

/**
 * Given a node and a context, get the first preceding sibling of the node
 * within the context. If no sibling precedes the node within the context,
 * `null` is returned.
 *
 * @see https://www.w3.org/TR/dom/#dom-node-previoussibling
 */
export function getPreviousSibling<T extends Node>(
  node: Node,
  context: Node,
  options: Readonly<{ composed?: boolean; flattened?: boolean }> = {}
): Node | null {
  const parentNode = getParentNode(node, context, options);

  if (parentNode === null) {
    return null;
  }

  const childNodes = Array.from(parentNode.childNodes);

  const previousIndex = childNodes.indexOf(node) - 1;

  if (previousIndex in childNodes) {
    return childNodes[previousIndex];
  }

  return null;
}
