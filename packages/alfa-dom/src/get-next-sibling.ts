import { None, Option, Some } from "@siteimprove/alfa-option";
import { getParentNode } from "./get-parent-node";
import { Node } from "./types";

/**
 * Given a node and a context, get the first following sibling of the node
 * within the context.
 *
 * @see https://dom.spec.whatwg.org/#dom-node-nextsibling
 */
export function getNextSibling<T extends Node>(
  node: Node,
  context: Node,
  options: getNextSibling.Options = {}
): Option<Node> {
  return getParentNode(node, context, options).flatMap(parentNode => {
    const childNodes = Array.from(parentNode.childNodes);
    const nextIndex = childNodes.indexOf(node) + 1;

    if (nextIndex in childNodes) {
      return Some.of(childNodes[nextIndex]);
    }

    return None;
  });
}

export namespace getNextSibling {
  export type Options = getParentNode.Options;
}
