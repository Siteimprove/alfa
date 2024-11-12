import { Cache } from "@siteimprove/alfa-cache";
import type { Sequence } from "@siteimprove/alfa-sequence";
import { Node } from "../../node.js";
import { Element } from "../element.js";

const _elementDescendantsCache = Cache.empty<Node, Array<Sequence<Element>>>();

/**
 * @public
 */
export function getElementDescendants(
  node: Node,
  options: Node.Traversal = Node.Traversal.empty,
): Sequence<Element> {
  const optionsMap = _elementDescendantsCache.get(node, () => []);
  if (optionsMap[options.value] === undefined) {
    optionsMap[options.value] = node
      .descendants(options)
      .filter(Element.isElement);
  }

  return optionsMap[options.value];
}

/**
 * @public
 */
export function getInclusiveElementDescendants(
  node: Element,
  options: Node.Traversal = Node.Traversal.empty,
): Sequence<Element> {
  return getElementDescendants(node, options).prepend(node);
}
