import { Cache } from "@siteimprove/alfa-cache";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Node } from "../../node";
import { Element } from "../element";

const _elementDescendantsCache = Cache.empty<Node, Array<Sequence<Element>>>();

/**
 * @public
 */
export function getElementDescendants(
  node: Node,
  options: Node.Traversal = Node.Traversal.empty
): Sequence<Element> {
  const optionsMap = _elementDescendantsCache.get(node, () => []);
  if (optionsMap[options.value] === undefined) {
    optionsMap[options.value] = node
      .descendants(options)
      .filter(Element.isElement);
  }

  return optionsMap[options.value];
}
