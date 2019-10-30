import { None, Option, Some } from "@siteimprove/alfa-option";
import { getParentNode } from "./get-parent-node";
import { isElement } from "./guards";
import { Element, Node } from "./types";

/**
 * Given a node and a context, get the first following element sibling of the
 * node within the context.
 *
 * @see https://dom.spec.whatwg.org/#dom-nondocumenttypechildnode-nextelementsibling
 */
export function getNextElementSibling<T extends Node>(
  node: Node,
  context: Node,
  options: getNextElementSibling.Options = {}
): Option<Element> {
  return getParentNode(node, context, options).flatMap(parentNode => {
    const childNodes = Array.from(parentNode.childNodes);

    for (
      let i = childNodes.indexOf(node) + 1, n = childNodes.length;
      i < n;
      i++
    ) {
      const sibling = childNodes[i];

      if (isElement(sibling)) {
        return Some.of(sibling);
      }
    }

    return None;
  });
}

export namespace getNextElementSibling {
  export type Options = getParentNode.Options;
}
