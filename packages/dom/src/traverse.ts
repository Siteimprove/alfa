import { Node } from "./types";
import { isParent, isElement } from "./guards";

export type TraverseOptions = Readonly<{
  composed?: boolean;
}>;

/**
 * @see https://www.w3.org/TR/dom/#concept-tree-order
 */
export function traverse(
  root: Node,
  visitor: (node: Node, parent: Node | null) => false | void,
  options: TraverseOptions = {}
): void {
  const queue: Array<Node> = [];

  for (
    let child: Node | undefined = root, parent: Node | undefined;
    child;
    child = queue.pop(), parent = queue.pop()
  ) {
    if (visitor(child, parent || null) === false) {
      continue;
    }

    const { childNodes } = child;

    for (let i = childNodes.length - 1; i >= 0; i--) {
      queue.push(child, childNodes[i]);
    }

    // Shadow roots should be traversed as soon as they're encountered per the
    // definition of shadow-inclduing preorder depth-first traversal; the shadow
    // root is therefore pushed in front of the queue.
    // https://www.w3.org/TR/dom41/#shadow-including-preorder-depth-first-traversal
    if (options.composed && isElement(child) && child.shadowRoot !== null) {
      queue.push(child, child.shadowRoot);
    }
  }
}
