import { Node } from "./types";
import { isElement } from "./guards";

export function traverseNode(
  context: Node,
  visitor: (target: Node, parent: Node | null) => false | void,
  options: { composed?: boolean } = {}
): void {
  const queue: Array<Node> = [];

  for (
    let child: Node | undefined = context, parent: Node | undefined;
    child;
    child = queue.pop(), parent = queue.pop()
  ) {
    if (visitor(child, parent || null) === false) {
      break;
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
