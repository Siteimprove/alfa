import { getParentNode } from "./get-parent-node";
import { Node } from "./types";

/**
 * Given a node and a context, get the first following sibling of the node
 * within the context. If no sibling follows the node within the context,
 * `null` is returned.
 *
 * @see https://www.w3.org/TR/dom/#dom-node-nextsibling
 */
export function getNextSibling<T extends Node>(
  node: Node,
  context: Node,
  options: getNextSibling.Options = {}
): Node | null {
  const parentNode = getParentNode(node, context, options);

  if (parentNode === null) {
    return null;
  }

  const childNodes = Array.from(parentNode.childNodes);

  const nextIndex = childNodes.indexOf(node) + 1;

  if (nextIndex in childNodes) {
    return childNodes[nextIndex];
  }

  return null;
}

export namespace getNextSibling {
  export type Options = getParentNode.Options;
}
