import { Node } from "./types";
import { isParent, isElement } from "./guards";

export type TraverseOptions = Readonly<{
  deep?: boolean;
}>;

/**
 * @see https://www.w3.org/TR/dom/#concept-tree-order
 */
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

    // Shadow roots should be traversed as soon as they're encountered per the
    // definition of shadow-inclduing preorder depth-first traversal; the shadow
    // root is therefore pushed in front of the queue.
    // https://www.w3.org/TR/dom41/#shadow-including-preorder-depth-first-traversal
    if (options.deep && isElement(next) && next.shadowRoot !== null) {
      queue.push(next.shadowRoot);
    }
  }
}
