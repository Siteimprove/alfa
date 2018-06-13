import { Node } from "./types";
import { isElement } from "./guards";
import { getAssignedNodes } from "./get-assigned-nodes";

export type NodeVisitor = (node: Node, parentNode: Node | null) => false | void;

export function traverseNode(
  context: Node,
  visitors: Readonly<{ enter?: NodeVisitor; exit?: NodeVisitor }>,
  options: Readonly<{ composed?: boolean; flattened?: boolean }> = {}
): boolean {
  return visitNode(context, null, context, visitors, options);
}

function visitNode(
  node: Node,
  parentNode: Node | null,
  context: Node,
  visitors: Readonly<{ enter?: NodeVisitor; exit?: NodeVisitor }>,
  options: Readonly<{ composed?: boolean; flattened?: boolean }>
): boolean {
  const shadowRoot = isElement(node) ? node.shadowRoot : null;

  // https://drafts.csswg.org/css-scoping/#flattening
  if (options.flattened) {
    if (isElement(node) && node.localName === "slot") {
      const childNodes = getAssignedNodes(node, context);

      for (let i = 0, n = childNodes.length; i < n; i++) {
        if (!visitNode(childNodes[i], parentNode, context, visitors, options)) {
          return false;
        }
      }

      return true;
    }

    if (shadowRoot !== null) {
      const { childNodes } = shadowRoot;

      for (let i = 0, n = childNodes.length; i < n; i++) {
        if (!visitNode(childNodes[i], node, context, visitors, options)) {
          return false;
        }
      }

      return true;
    }
  }

  const { enter, exit } = visitors;

  if (enter !== undefined && enter(node, parentNode || null) === false) {
    return false;
  }

  // Shadow roots should be traversed as soon as they're encountered per the
  // definition of shadow-including preorder depth-first traversal.
  // https://www.w3.org/TR/dom41/#shadow-including-preorder-depth-first-traversal
  if (options.composed && shadowRoot !== null) {
    if (!visitNode(shadowRoot, node, context, visitors, options)) {
      return false;
    }
  }

  const { childNodes } = node;

  for (let i = 0, n = childNodes.length; i < n; i++) {
    if (!visitNode(childNodes[i], node, context, visitors, options)) {
      return false;
    }
  }

  if (exit !== undefined && exit(node, parentNode || null) === false) {
    return false;
  }

  return true;
}
