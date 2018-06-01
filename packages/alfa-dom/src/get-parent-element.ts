import { Node, Element } from "./types";
import { isElement } from "./guards";
import { getParentNode } from "./get-parent-node";

/**
 * Given a node and a context, get the parent element of the node within the
 * context.
 *
 * @see https://www.w3.org/TR/dom/#dom-node-parentelement
 */
export function getParentElement(
  node: Node,
  context: Node,
  options: Readonly<{ composed?: boolean }> = {}
): Element | null {
  const parentNode = getParentNode(node, context, options);

  if (parentNode === null || !isElement(parentNode)) {
    return null;
  }

  return parentNode;
}
