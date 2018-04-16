import { Node, ParentNode } from "./types";
import { isParent, isShadowRoot } from "./guards";

export function getRoot(
  node: Node,
  options: { composed?: boolean } = {}
): ParentNode | null {
  let root: ParentNode | null = isParent(node) ? node : null;

  while (root) {
    if (root.parentNode !== null) {
      root = root.parentNode;
    } else if (options.composed && isShadowRoot(root)) {
      root = root.host;
    } else {
      break;
    }
  }

  return root;
}
