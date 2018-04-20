import { Node } from "./types";
import { isParent } from "./guards";
import { traverse } from "./traverse";

export function getParent(node: Node, context: Node): Node | null {
  let parent: Node | null = null;

  traverse(
    context,
    (candidate, found) => {
      if (parent !== null) {
        return false;
      }

      if (node === candidate) {
        parent = found;
      }
    },
    { composed: true }
  );

  return parent;
}
