import { Node } from "./types";
import { isElement } from "./guards";
import { getParent } from "./get-parent";

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
