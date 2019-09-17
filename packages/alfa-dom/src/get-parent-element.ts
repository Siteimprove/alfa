import { getParentNode } from "./get-parent-node";
import { isElement } from "./guards";
import { Element, Node } from "./types";

/**
 * Given a node and a context, get the parent element of the node within the
 * context. If the node has no parent element within the context, `null` is
 * returned.
 *
 * @see https://dom.spec.whatwg.org/#dom-node-parentelement
 */
export function getParentElement(
  node: Node,
  context: Node,
  options: getParentElement.Options = {}
): Element | null {
  const parentNode = getParentNode(node, context, {
    ...options,
    composed: false
  });

  if (parentNode === null || !isElement(parentNode)) {
    return null;
  }

  return parentNode;
}

export namespace getParentElement {
  export interface Options {
    readonly flattened?: boolean;
  }
}
