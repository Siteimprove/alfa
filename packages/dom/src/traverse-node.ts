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

  const entries: Array<Node> = [];
  const exits: Array<Node | undefined> = [];

  for (
    let child: Node | undefined = context, parent: Node | undefined;
    child;
    child = entries.pop(), parent = entries.pop()
  ) {
    if (visitors.enter(child, parent || null) === false) {
      break;
    }

    const { childNodes } = child;

    if (childNodes.length === 0) {
      if (visitors.exit(child, parent || null) === false) {
        break;
      }
    } else {
      exits.push(parent, child);
    }

    if (parent && last(parent.childNodes) === child) {
      const child = exits.pop()!,
        parent = exits.pop();

      if (visitors.exit(child, parent || null) === false) {
        break;
      }
    }

    for (let i = childNodes.length - 1; i >= 0; i--) {
      entries.push(child, childNodes[i]);
    }

    // Shadow roots should be traversed as soon as they're encountered per the
    // definition of shadow-inclduing preorder depth-first traversal; the shadow
    // root is therefore pushed in front of the queue.
    // https://www.w3.org/TR/dom41/#shadow-including-preorder-depth-first-traversal
    if (options.composed && isElement(child) && child.shadowRoot !== null) {
      entries.push(child, child.shadowRoot);
    }
  }
}
