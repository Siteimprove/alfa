import { Node, ParentNode } from "./types";
import { isParent } from "./guards";

export function getRoot(node: Node): ParentNode | null {
  let root: ParentNode | null = isParent(node) ? node : null;

  while (root) {
    if (root.parentNode !== null) {
      root = root.parentNode;
    } else {
      break;
    }
  }

  return root;
}
