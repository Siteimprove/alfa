import { Node } from "./types";
import { isParent, isElement } from "./guards";

export type TraverseOptions = Readonly<{
  deep?: boolean;
}>;

export function traverse(
  root: Node,
  visitor: (node: Node) => false | void,
  options: TraverseOptions = {}
) {
  const queue: Array<Node> = [];

  for (let next: Node | undefined = root; next; next = queue.pop()) {
    if (visitor(next) === false) {
      continue;
    }

    const { childNodes } = next;

    for (let i = childNodes.length - 1; i >= 0; i--) {
      queue.push(childNodes[i]);
    }

    if (options.deep && isElement(next) && next.shadowRoot !== null) {
      queue.push(next.shadowRoot);
    }
  }
}
