import { getParentNode } from "./get-parent-node";
import { isElement } from "./guards";
import { Element, Node } from "./types";

/**
 * Given a node and a context, get the first preceding sibling, that is an
 * element, of the node within the context. If no sibling that is an element
 * precedes the node within the context, `null` is returned.
 *
 * @see https://dom.spec.whatwg.org/#dom-nondocumenttypechildnode-previouselementsibling
 */
export function getPreviousElementSibling<T extends Node>(
  node: Node,
  context: Node,
  options: getPreviousElementSibling.Options = {}
): Element | null {
  const parentNode = getParentNode(node, context, options);

  if (parentNode === null) {
    return null;
  }

  const childNodes = Array.from(parentNode.childNodes);

  for (let i = childNodes.indexOf(node) - 1; i >= 0; i--) {
    const sibling = childNodes[i];

    if (isElement(sibling)) {
      return sibling;
    }
  }

  return null;
}

export namespace getPreviousElementSibling {
  export type Options = getParentNode.Options;
}
