import { Parent, Child } from "./types";
import { isChild, isParent } from "./guards";

export function getRoot(child: Child): Parent | null {
  let root = isParent(child) ? child : child.parent;

  while (root) {
    if (isChild(root) && root.parent) {
      root = root.parent;
    } else {
      break;
    }
  }

  return root;
}
