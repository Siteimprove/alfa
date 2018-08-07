import { getParentNode } from "./get-parent-node";
import { isElement } from "./guards";
import { Element, Node } from "./types";

/**
 * Given a node and a context, get the parent element of the node within the
 * context. If the node has no parent element within the context, `null` is
 * returned.
 *
 * @see https://www.w3.org/TR/dom/#dom-node-parentelement
 */
export function getParentElement(
  node: Node,
  context: Node,
  options: Readonly<{ composed?: boolean; flattened?: boolean }> = {}
): Element | null {
  const parentNode = getParentNode(node, context, options);

  if (parentNode === null || !isElement(parentNode)) {
    return null;
  }

  return parentNode;
}
