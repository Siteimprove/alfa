import { getAssignedNodes } from "./get-assigned-nodes";
import { getParentNode } from "./get-parent-node";
import { isElement } from "./guards";
import { Node } from "./types";

const commands: traverseNode.Commands = {
  skip: traverseNode.Command.Skip,
  exit: traverseNode.Command.Exit
};

/**
 * Given a node and a context, perform a depth-first traversal of the node
 * within the context, invoking the given visitors for the node itself and all
 * of its children. A visitor may return `Exit` in order to stop the traversal,
 * resulting in the function itself returning `false`. If traversal finishes
 * without interruption, `true` is returned. A visitor may also return `Skip`
 * in order to skip recursive traversal of a given node.
 *
 * @see https://dom.spec.whatwg.org/#concept-tree-order
 */
export function traverseNode(
  node: Node,
  context: Node,
  visitors: traverseNode.Visitors,
  options: traverseNode.Options = {}
): boolean {
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

  export const enum Command {
    Skip,
    Exit
  }

  export interface Commands {
    readonly skip: Command.Skip;
    readonly exit: Command.Exit;
  }

  export type Visitor = (
    node: Node,
    parentNode: Node | null,
    commands: Commands
  ) => Command | void;

  export interface Visitors {
    readonly enter?: Visitor;
    readonly exit?: Visitor;
  }
}

function visitNode(
  node: Node,
  parentNode: Node | null,
  context: Node,
  visitors: traverseNode.Visitors,
  options: traverseNode.Options
): boolean {
  if (options.flattened === true) {
    if (isElement(node) && node.localName === "slot") {
      const childNodes = getAssignedNodes(node, context);

      for (const childNode of childNodes) {
        if (!visitNode(childNode, parentNode, context, visitors, options)) {
          return false;
        }
      }

      return true;
    }
  }

  const { enter, exit } = visitors;

  if (enter !== undefined) {
    const status = enter(node, parentNode, commands);

    if (status === traverseNode.Command.Exit) {
      return false;
    }

    if (status === traverseNode.Command.Skip) {
      return true;
    }
  }

  const shadowRoot = isElement(node) ? node.shadowRoot : null;

  if (shadowRoot !== null && shadowRoot !== undefined) {
    if (options.flattened === true) {
      const { childNodes } = shadowRoot;

      for (let i = 0, n = childNodes.length; i < n; i++) {
        if (!visitNode(childNodes[i], node, context, visitors, options)) {
          return false;
        }
      }

      if (
        exit !== undefined &&
        exit(node, parentNode, commands) === traverseNode.Command.Exit
      ) {
        return false;
      }

      return true;
    }

    // Shadow roots should be traversed as soon as they're encountered per the
    // definition of shadow-including preorder depth-first traversal.
    // https://dom.spec.whatwg.org/#shadow-including-preorder-depth-first-traversal
    if (options.composed === true) {
      if (!visitNode(shadowRoot, node, context, visitors, options)) {
        return false;
      }
    }
  }

  const contentDocument = isElement(node) ? node.contentDocument : null;

  if (contentDocument !== null && contentDocument !== undefined) {
    if (options.nested === true) {
      if (!visitNode(contentDocument, null, context, visitors, options)) {
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

  if (
    exit !== undefined &&
    exit(node, parentNode, commands) === traverseNode.Command.Exit
  ) {
    return false;
  }

  return true;
}
