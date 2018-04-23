import { Node } from "./types";
import { isElement } from "./guards";
import { getParent } from "./get-parent";

/**
 * Given a node and a context, get the root of the node within the context.
 */
export function getRoot(
  node: Node,
  context: Node,
  options: { composed?: boolean } = {}
): Node {
  let root: Node | null = node;

  while (root) {
    const parent = getParent(root, context);

    if (parent === null) {
      break;
    }

    if (
      isElement(parent) &&
      options.composed !== true &&
      parent.shadowRoot === root
    ) {
      break;
    }

    root = parent;
  }

  return root;
}
