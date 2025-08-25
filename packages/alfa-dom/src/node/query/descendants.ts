import { Cache } from "@siteimprove/alfa-cache";
import type { Predicate } from "@siteimprove/alfa-predicate";
import type { Refinement } from "@siteimprove/alfa-refinement";
import { Sequence } from "@siteimprove/alfa-sequence";

import { Node } from "../../node.js";
import { Element } from "../element.js";

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
    return Sequence.from(getDescendantsV2(predicate)(node, options));
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
  return Sequence.from(getInclusiveElementDescendantsV2(node, options));
}

const _descendantsCache = Cache.empty<
  Predicate<Node>,
  Cache<Node, Array<Array<Node>>>
>();

export function getDescendantsV2<T extends Node>(
  refinement: Refinement<Node, T>,
): (node: Node, options?: Node.Traversal) => Array<T>;

export function getDescendantsV2(
  predicate: Predicate<Node>,
): (node: Node, options?: Node.Traversal) => Array<Node>;

export function getDescendantsV2(
  predicate: Predicate<Node>,
): (node: Node, options?: Node.Traversal) => Array<Node> {
  return (node, options = Node.Traversal.empty) => {
    const optionsMap = _descendantsCache
      .get(predicate, Cache.empty)
      .get(node, () => []);

    if (optionsMap[options.value] === undefined) {
      optionsMap[options.value] = node.descendantsV2(options).filter(predicate);
    }

    return optionsMap[options.value];
  };
}

export const getElementDescendantsV2 = getDescendantsV2(Element.isElement);

export function getInclusiveElementDescendantsV2(
  node: Element,
  options: Node.Traversal = Node.Traversal.empty,
): Array<Element> {
  return [node, ...getElementDescendantsV2(node, options)];
}
