import { Node } from "./types";
import { getParentNode } from "./get-parent-node";

/**
 * Given a node and a context, get the root of the node within the context.
 *
 * @see https://dom.spec.whatwg.org/#dom-node-getrootnode
 */
export function getRootNode(
  node: Node,
  context: Node,
  options: { composed?: boolean } = {}
): Node {
  let rootNode: Node | null = node;

  while (rootNode) {
    const parentNode = getParentNode(rootNode, context, options);

    if (parentNode === null) {
      break;
    }

    rootNode = parentNode;
  }

  return rootNode;
}
