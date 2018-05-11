import { last, noop } from "@alfa/util";
import { Node } from "./types";
import { isElement } from "./guards";

export type NodeVisitor = (target: Node, parent: Node | null) => false | void;

export function traverseNode(
  context: Node,
  visitor: NodeVisitor | Readonly<{ enter: NodeVisitor; exit: NodeVisitor }>,
  options: { composed?: boolean } = {}
): void {
  const visitors =
    typeof visitor === "function" ? { enter: visitor, exit: noop } : visitor;

  const queue: Array<Node> = [];

  const exits: Map<Node, () => false | void> = new Map();

  for (
    let child: Node | undefined = context, parent: Node | undefined;
    child;
    child = queue.pop(), parent = queue.pop()
  ) {
    if (visitors.enter(child, parent || null) === false) {
      break;
    }

    const { childNodes } = child;

    const exit = last(childNodes);

    const args = { child, parent };

    if (exit === null) {
      if (visitors.exit(args.child, args.parent || null) === false) {
        break;
      }
    } else {
      exits.set(exit, () => visitors.exit(args.child, args.parent || null));
    }

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

    if (exits.has(child)) {
      const exit = exits.get(child)!;

      if (exit() === false) {
        break;
      }
    }
  }
}
