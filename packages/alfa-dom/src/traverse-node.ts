import { Node } from "./types";
import { isElement } from "./guards";

enum Action {
  Enter,
  Exit
}

export type NodeVisitor = (node: Node, parentNode: Node | null) => false | void;

export function traverseNode(
  context: Node,
  visitors: Readonly<{ enter?: NodeVisitor; exit?: NodeVisitor }>,
  options: { composed?: boolean } = {}
): void {
  const nodes: Array<Node> = [];
  const actions: Array<Action> = [];

  function push(action: Action, node: Node, parentNode?: Node): void {
    if (parentNode === undefined) {
      nodes.push(node);
    } else {
      nodes.push(parentNode, node);
    }

    actions.push(action);
  }

  let action: Action | undefined;
  let node: Node | undefined;
  let parentNode: Node | undefined;

  for (
    action = Action.Enter, node = context;
    node !== undefined;
    action = actions.pop(), node = nodes.pop(), parentNode = nodes.pop()
  ) {
    if (action === Action.Enter) {
      if (
        visitors.enter !== undefined &&
        visitors.enter(node, parentNode || null) === false
      ) {
        break;
      }

      const { childNodes } = node;

      const shadowRoot = isElement(node) ? node.shadowRoot : null;

      if (visitors.exit !== undefined) {
        if (childNodes.length > 0 || shadowRoot !== null) {
          push(Action.Exit, node, parentNode);
        } else if (visitors.exit(node, parentNode || null) === false) {
          break;
        }
      }

      for (let i = childNodes.length - 1; i >= 0; i--) {
        push(Action.Enter, childNodes[i], node);
      }

      // Shadow roots should be traversed as soon as they're encountered per the
      // definition of shadow-inclduing preorder depth-first traversal; the
      // shadow root is therefore pushed in front of the queue.
      // https://www.w3.org/TR/dom41/#shadow-including-preorder-depth-first-traversal
      if (options.composed && shadowRoot !== null) {
        push(Action.Enter, shadowRoot, node);
      }
    } else {
      // Exit actions will only ever be pushed if an exit visitor is defined. We
      // can therefore safely assert that the exit visitor is defined.
      if (visitors.exit!(node, parentNode || null) === false) {
        break;
      }
    }
  }
}
