import { Node } from "./types";
import { isElement } from "./guards";
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
    const parentNode = getParentNode(rootNode, context);

    if (parentNode === null) {
      break;
    }

    if (
      isElement(parentNode) &&
      options.composed !== true &&
      parentNode.shadowRoot === rootNode
    ) {
      break;
    }

    rootNode = parentNode;
  }

  return rootNode;
}
