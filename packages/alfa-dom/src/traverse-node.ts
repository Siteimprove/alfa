import { getAssignedNodes } from "./get-assigned-nodes";
import { getParentNode } from "./get-parent-node";
import { isElement } from "./guards";
import { Node } from "./types";

export type NodeVisitor = (node: Node, parentNode: Node | null) => false | void;

/**
 * Given a node and a context, perform a depth-first traversal of the node
 * within the context, invoking the given visitors for the node itself and all
 * of its children. A visitor may return `false` in order to stop the
 * traversal, resulting in the function itself returning `false`. If traversal
 * finishes without interruption, `true` is returned.
 *
 * @see https://www.w3.org/TR/dom/#concept-tree-order
 */
export function traverseNode(
  node: Node,
  context: Node,
  visitors: Readonly<{ enter?: NodeVisitor; exit?: NodeVisitor }>,
  options: Readonly<{ composed?: boolean; flattened?: boolean }> = {}
): boolean {
  let parentNode: Node | null = null;

  if (node !== context) {
    parentNode = getParentNode(node, context);
  }

  return visitNode(node, parentNode, context, visitors, options);
}

function visitNode(
  node: Node,
  parentNode: Node | null,
  context: Node,
  visitors: Readonly<{ enter?: NodeVisitor; exit?: NodeVisitor }>,
  options: Readonly<{ composed?: boolean; flattened?: boolean }>
): boolean {
  if (options.flattened === true) {
    if (isElement(node) && node.localName === "slot") {
      const childNodes = getAssignedNodes(node, context);

      for (let i = 0, n = childNodes.length; i < n; i++) {
        if (!visitNode(childNodes[i], parentNode, context, visitors, options)) {
          return false;
        }
      }

      return true;
    }
  }

  const { enter, exit } = visitors;

  if (enter !== undefined && enter(node, parentNode) === false) {
    return false;
  }

  const shadowRoot = isElement(node) ? node.shadowRoot : null;

  if (shadowRoot !== null) {
    if (options.flattened === true) {
      const { childNodes } = shadowRoot;

      for (let i = 0, n = childNodes.length; i < n; i++) {
        if (!visitNode(childNodes[i], node, context, visitors, options)) {
          return false;
        }
      }

      if (exit !== undefined && exit(node, parentNode) === false) {
        return false;
      }

      return true;
    }

    // Shadow roots should be traversed as soon as they're encountered per the
    // definition of shadow-including preorder depth-first traversal.
    // https://www.w3.org/TR/dom41/#shadow-including-preorder-depth-first-traversal
    if (options.composed === true) {
      if (!visitNode(shadowRoot, node, context, visitors, options)) {
        return false;
      }
    }
  }

  const { childNodes } = node;

  for (let i = 0, n = childNodes.length; i < n; i++) {
    if (!visitNode(childNodes[i], node, context, visitors, options)) {
      return false;
    }
  }

  if (exit !== undefined && exit(node, parentNode) === false) {
    return false;
  }

  return true;
}
