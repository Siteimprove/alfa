import { Node } from "./types";
import { isParent } from "./guards";

export function traverse(root: Node, visitor: (node: Node) => false | void) {
  const queue: Array<Node> = [];

  for (let next: Node | undefined = root; next; next = queue.pop()) {
    if (visitor(next) === false) {
      continue;
    }

    if (isParent(next)) {
      const { children } = next;

      for (let i = children.length - 1; i >= 0; i--) {
        queue.push(children[i]);
      }
    }
  }
}
