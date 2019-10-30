import { None, Option, Some } from "@siteimprove/alfa-option";
import { getParentNode } from "./get-parent-node";
import { isElement } from "./guards";
import { Element, Node } from "./types";

/**
 * Given a node and a context, get the first preceding element sibling of the
 * node within the context.
 *
 * @see https://dom.spec.whatwg.org/#dom-nondocumenttypechildnode-previouselementsibling
 */
export function getPreviousElementSibling<T extends Node>(
  node: Node,
  context: Node,
  options: getPreviousElementSibling.Options = {}
): Option<Element> {
  return getParentNode(node, context, options).flatMap(parentNode => {
    const childNodes = Array.from(parentNode.childNodes);

    for (let i = childNodes.indexOf(node) - 1; i >= 0; i--) {
      const sibling = childNodes[i];

      if (isElement(sibling)) {
        return Some.of(sibling);
      }
    }

    return None;
  });
}

export namespace getPreviousElementSibling {
  export type Options = getParentNode.Options;
}
