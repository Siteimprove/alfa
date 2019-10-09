import { getAssignedNodes } from "./get-assigned-nodes";
import { getParentNode } from "./get-parent-node";
import { isElement } from "./guards";
import { Node } from "./types";

/**
 * Given a node and a context, perform a depth-first traversal of the node
 * within the context, invoking the given visitors for the node itself and its
 * descendants.
 *
 * @see https://dom.spec.whatwg.org/#concept-tree-order
 */
export function traverseNode<T>(
  node: Node,
  context: Node,
  visitors: traverseNode.Visitors<T>,
  options: traverseNode.Options = {}
): Iterable<T> {
  let parentNode: Node | null = null;

  if (node !== context) {
    parentNode = getParentNode(node, context, options);
  }

  return visitNode(node, parentNode, context, visitors, options);
}

export namespace traverseNode {
  export interface Options {
    readonly composed?: boolean;
    readonly flattened?: boolean;
    readonly nested?: boolean;
  }

  /**
   * A visitor is a generator function invoked when visiting a node. A visitor
   * may yield values which are then also yielded by the `traverseNode()`
   * function. Certain visitors also allow returning values, which can signal
   * different things depending on the visitor.
   */
  export type Visitor<T, R = void, N = unknown> = (
    node: Node,
    parentNode: Node | null
  ) => Generator<T, R | void, N>;

  export interface Visitors<T> {
    /**
     * This visitor is invoked when a node is first encountered. If the `enter`
     * visitor returns `false`, the subtree rooted at the current node is not
     * visited.
     */
    readonly enter?: Visitor<T, boolean>;

    /**
     * This visitor is invoked when a node is left. This happens when the
     * subtree rooted at the current node has also been visited. If the current
     * node has no subtree, or the subtree has been skipped, the `exit` visitor
     * is invoked immediately after the `enter` visitor.
     */
    readonly exit?: Visitor<T>;
  }
}

function* visitNode<T>(
  node: Node,
  parentNode: Node | null,
  context: Node,
  visitors: traverseNode.Visitors<T>,
  options: traverseNode.Options
): Generator<T, void> {
  if (options.flattened === true) {
    if (isElement(node) && node.localName === "slot") {
      const childNodes = getAssignedNodes(node, context);

      for (const childNode of childNodes) {
        yield* visitNode(childNode, parentNode, context, visitors, options);
      }

      return;
    }
  }

  const { enter, exit } = visitors;

  if (enter !== undefined) {
    const subtree = yield* enter(node, parentNode);

    if (subtree === false) {
      if (exit !== undefined) {
        yield* exit(node, parentNode);
      }

      return;
    }
  }

  const shadowRoot = isElement(node) ? node.shadowRoot : null;

  if (shadowRoot !== null && shadowRoot !== undefined) {
    if (options.flattened === true) {
      const { childNodes } = shadowRoot;

      for (let i = 0, n = childNodes.length; i < n; i++) {
        yield* visitNode(childNodes[i], node, context, visitors, options);
      }

      if (exit !== undefined) {
        yield* exit(node, parentNode);
      }

      return;
    }

    // Shadow roots should be traversed as soon as they're encountered per the
    // definition of shadow-including tree order.
    // https://dom.spec.whatwg.org/#concept-shadow-including-tree-order
    if (options.composed === true) {
      yield* visitNode(shadowRoot, node, context, visitors, options);
    }
  }

  const contentDocument = isElement(node) ? node.contentDocument : null;

  if (contentDocument !== null && contentDocument !== undefined) {
    if (options.nested === true) {
      yield* visitNode(contentDocument, null, context, visitors, options);
    }
  }

  const { childNodes } = node;

  for (let i = 0, n = childNodes.length; i < n; i++) {
    yield* visitNode(childNodes[i], node, context, visitors, options);
  }

  if (exit !== undefined) {
    yield* exit(node, parentNode);
  }
}
