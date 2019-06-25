import { getParentNode } from "./get-parent-node";
import { isElement } from "./guards";
import { Element, Node } from "./types";

/**
 * Given a node and a context, get the first following sibling, that is an
 * element, of the node within the context. If no sibling that is an element
 * follows the node within the context, `null` is returned.
 *
 * @see https://www.w3.org/TR/dom/#dom-nondocumenttypechildnode-nextelementsibling
 */
export function getNextElementSibling<T extends Node>(
  node: Node,
  context: Node,
  options: Readonly<{ composed?: boolean; flattened?: boolean }> = {}
): Element | null {
  const parentNode = getParentNode(node, context, options);

  if (parentNode === null) {
    return null;
  }

  const childNodes = Array.from(parentNode.childNodes);
  const { length } = childNodes;

  for (let i = childNodes.indexOf(node) + 1, n = length; i < n; i++) {
    const sibling = childNodes[i];

    if (isElement(sibling)) {
      return sibling;
    }
  }

  return null;
}
