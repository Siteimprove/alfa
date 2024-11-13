import { Cache } from "@siteimprove/alfa-cache";
import type { Predicate } from "@siteimprove/alfa-predicate";
import type { Refinement } from "@siteimprove/alfa-refinement";
import type { Sequence } from "@siteimprove/alfa-sequence";

import { Node } from "../../node.js";
import { Element } from "../element.js";

const _descendantsCache = Cache.empty<
  Predicate<Node>,
  Cache<Node, Array<Sequence<Node>>>
>();

/**
 * Get all descendants of a node that satisfy a given refinement.
 *
 * @remarks
 * In order to properly cache results for improved performance, care must be taken
 * to use the exact same refinement (JS object) and not merely a clone of it.
 *
 * @public
 */
export function getDescendants<T extends Node>(
  refinement: Refinement<Node, T>,
): (node: Node, options?: Node.Traversal) => Sequence<T>;

/**
 * Get all descendants of a node that satisfy a given predicate.
 *
 * @remarks
 * In order to properly cache results for improved performance, care must be taken
 * to use the exact same predicate (JS object) and not merely a clone of it.
 *
 * @public
 */
export function getDescendants(
  predicate: Predicate<Node>,
): (node: Node, options?: Node.Traversal) => Sequence<Node>;

export function getDescendants(
  predicate: Predicate<Node>,
): (node: Node, options?: Node.Traversal) => Sequence<Node> {
  return (node, options = Node.Traversal.empty) => {
    const optionsMap = _descendantsCache
      .get(predicate, Cache.empty)
      .get(node, () => []);

    if (optionsMap[options.value] === undefined) {
      optionsMap[options.value] = node.descendants(options).filter(predicate);
    }

    return optionsMap[options.value];
  };
}

/**
 * @public
 */
export const getElementDescendants = getDescendants(Element.isElement);

/**
 * @public
 */
export function getInclusiveElementDescendants(
  node: Element,
  options: Node.Traversal = Node.Traversal.empty,
): Sequence<Element> {
  return getElementDescendants(node, options).prepend(node);
}
