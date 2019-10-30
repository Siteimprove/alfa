import { None, Option, Some } from "@siteimprove/alfa-option";
import { getParentNode } from "./get-parent-node";
import { Node } from "./types";

/**
 * Given a node and a context, get the first preceding sibling of the node
 * within the context.
 *
 * @see https://dom.spec.whatwg.org/#dom-node-previoussibling
 */
export function getPreviousSibling<T extends Node>(
  node: Node,
  context: Node,
  options: getPreviousSibling.Options = {}
): Option<Node> {
  return getParentNode(node, context, options).flatMap(parentNode => {
    const childNodes = Array.from(parentNode.childNodes);
    const previousIndex = childNodes.indexOf(node) - 1;

    if (previousIndex in childNodes) {
      return Some.of(childNodes[previousIndex]);
    }

    return None;
  });
}

export namespace getPreviousSibling {
  export type Options = getParentNode.Options;
}
