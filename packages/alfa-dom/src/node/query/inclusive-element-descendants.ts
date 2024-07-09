import { Cache } from "@siteimprove/alfa-cache";
import type { Sequence } from "@siteimprove/alfa-sequence";
import { Node } from "../../node.js";
import { Element } from "../element.js";

const cache = Cache.empty<Element, Array<Sequence<Element>>>();

/**
 * @public
 */
export function getInclusiveElementDescendants(
  node: Element,
  options: Node.Traversal = Node.Traversal.empty,
): Sequence<Element> {
  const optionsMap = cache.get(node, () => []);
  if (optionsMap[options.value] === undefined) {
    optionsMap[options.value] = node
      .inclusiveDescendants(options)
      .filter(Element.isElement);
  }

  return optionsMap[options.value];
}
