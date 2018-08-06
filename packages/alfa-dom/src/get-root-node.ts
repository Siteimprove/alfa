import { getParentNode } from "./get-parent-node";
import { Node } from "./types";

/**
 * Given a node and a context, get the root of the node within the context.
 *
 * @see https://dom.spec.whatwg.org/#dom-node-getrootnode
 */
export function getRootNode(
  node: Node,
  context: Node,
  options: Readonly<{ composed?: boolean; flattened?: boolean }> = {}
): Node {
  let rootNode: Node = node;

  while (true) {
    const parentNode = getParentNode(rootNode, context, options);

    if (parentNode === null) {
      break;
    }

    rootNode = parentNode;
  }

  return rootNode;
}
