import { last, noop } from "@siteimprove/alfa-util";
import { Node } from "./types";
import { isElement } from "./guards";

enum Action {
  Enter,
  Exit
}

export type NodeVisitor = (target: Node, parent: Node | null) => false | void;

export function traverseNode(
  context: Node,
  visitors: Readonly<{ enter?: NodeVisitor; exit?: NodeVisitor }>,
  options: { composed?: boolean } = {}
): void {
  const nodes: Array<Node> = [];
  const actions: Array<Action> = [];

  function push(action: Action, child: Node, parent?: Node): void {
    if (parent === undefined) {
      nodes.push(child);
    } else {
      nodes.push(parent, child);
    }

    actions.push(action);
  }

  let action: Action | undefined;
  let child: Node | undefined;
  let parent: Node | undefined;

  for (
    action = Action.Enter, child = context;
    child !== undefined;
    action = actions.pop(), child = nodes.pop(), parent = nodes.pop()
  ) {
    if (action === Action.Enter) {
      if (
        visitors.enter !== undefined &&
        visitors.enter(child, parent || null) === false
      ) {
        break;
      }

      const { childNodes } = child;

      const shadowRoot = isElement(child) ? child.shadowRoot : null;

      if (childNodes.length > 0 || shadowRoot !== null) {
        push(Action.Exit, child, parent);
      } else {
        if (
          visitors.exit !== undefined &&
          visitors.exit(child, parent || null) === false
        ) {
          break;
        }
      }

      for (let i = childNodes.length - 1; i >= 0; i--) {
        push(Action.Enter, childNodes[i], child);
      }

      // Shadow roots should be traversed as soon as they're encountered per the
      // definition of shadow-inclduing preorder depth-first traversal; the
      // shadow root is therefore pushed in front of the queue.
      // https://www.w3.org/TR/dom41/#shadow-including-preorder-depth-first-traversal
      if (options.composed && shadowRoot !== null) {
        push(Action.Enter, shadowRoot, child);
      }
    } else {
      if (
        visitors.exit !== undefined &&
        visitors.exit(child, parent || null) === false
      ) {
        break;
      }
    }
  }
}
