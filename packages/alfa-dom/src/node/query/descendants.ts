import { Cache } from "@siteimprove/alfa-cache";
import { LazyList } from "@siteimprove/alfa-lazy-list";
import type { Predicate } from "@siteimprove/alfa-predicate";
import type { Refinement } from "@siteimprove/alfa-refinement";

import { Node } from "../../node.js";
import { Element } from "../element.js";
import { Text } from "../text.js";

const _descendantsCache = Cache.empty<
  Predicate<Node>,
  Cache<Node, Array<LazyList<Node>>>
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
): (node: Node, options?: Node.Traversal) => LazyList<T>;

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
): (node: Node, options?: Node.Traversal) => LazyList<Node>;

export function getDescendants(
  predicate: Predicate<Node>,
): (node: Node, options?: Node.Traversal) => LazyList<Node> {
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
): LazyList<Element> {
  return getElementDescendants(node, options).prepend(node);
}

const _textCache = Cache.empty<
  TextGroupOptions<any>,
  Cache<Node, Array<LazyList<Text | TextGroup>>>
>();

/**
 * A group of text nodes with an associated label.
 *
 * @public
 */
export interface TextGroup {
  label: string;
  text: LazyList<Text>;
}

/**
 * Options for grouping text descendants.
 *
 * @public
 */
export interface TextGroupOptions<N extends Node = Node> {
  startsGroup: Refinement<Node, N>;
  getLabel: (node: N) => string;
}

const defaultTextOptions: TextGroupOptions<any> = {
  startsGroup: (node): node is any => false,
  getLabel: () => "",
};

/**
 * Get all text descendants of a node, optionally grouping some into labeled groups.
 *
 * @remarks
 * When a descendant matches `startsGroup`, all of its text descendants are collected
 * into a {@link TextGroup} with a label from `getLabel`. Text nodes outside such
 * sub-trees are returned as plain {@link Text} nodes.
 *
 * Groups are not nested: if a `startsGroup` node contains another `startsGroup` node,
 * the inner node's text is included in the outer group, not as a separate group.
 *
 * @public
 */
export function getTextDescendants<N extends Node = Node>(
  textOptions: TextGroupOptions<N> = defaultTextOptions,
): (node: Node, options?: Node.Traversal) => LazyList<Text | TextGroup> {
  return (node, options = Node.Traversal.empty) => {
    const optionsMap = _textCache
      .get(textOptions, Cache.empty)
      .get(node, () => []);

    if (optionsMap[options.value] === undefined) {
      optionsMap[options.value] = LazyList.from(
        _getTextDescendants(node, textOptions, options),
      );
    }

    return optionsMap[options.value];
  };
}

function* _getTextDescendants<N extends Node = Node>(
  node: Node,
  textOptions: TextGroupOptions<N>,
  traversalOptions: Node.Traversal,
): Generator<Text | TextGroup> {
  const { startsGroup, getLabel } = textOptions;

  for (const child of node.children(traversalOptions)) {
    if (startsGroup(child)) {
      const groupText = getDescendants(Text.isText)(child, traversalOptions);
      yield {
        label: getLabel(child),
        text: groupText,
      };
    } else if (Text.isText(child)) {
      yield child;
    } else {
      yield* _getTextDescendants(child, textOptions, traversalOptions);
    }
  }
}
