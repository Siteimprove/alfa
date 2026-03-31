import { Cache } from "@siteimprove/alfa-cache";
import type { Predicate } from "@siteimprove/alfa-predicate";
import type { Refinement } from "@siteimprove/alfa-refinement";
import { Sequence } from "@siteimprove/alfa-sequence";

import { BaseNode } from "../node.ts";
import { Element, Text } from "../slotable/index.ts";

const _descendantsCache = Cache.empty<
  Predicate<BaseNode>,
  Cache<BaseNode, Array<Sequence<BaseNode>>>
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
export function getDescendants<T extends BaseNode>(
  refinement: Refinement<BaseNode, T>,
): (node: BaseNode, options?: BaseNode.Traversal) => Sequence<T>;

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
  predicate: Predicate<BaseNode>,
): (node: BaseNode, options?: BaseNode.Traversal) => Sequence<BaseNode>;

export function getDescendants(
  predicate: Predicate<BaseNode>,
): (node: BaseNode, options?: BaseNode.Traversal) => Sequence<BaseNode> {
  return (node, options = BaseNode.Traversal.empty) => {
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
  options: BaseNode.Traversal = BaseNode.Traversal.empty,
): Sequence<Element> {
  return getElementDescendants(node, options).prepend(node);
}

const _textCache = Cache.empty<
  TextGroupOptions<any>,
  Cache<BaseNode, Array<Sequence<Text | TextGroup>>>
>();

/**
 * A group of text nodes with an associated label.
 *
 * @public
 */
export interface TextGroup {
  node: BaseNode;
  label: string;
  text: Sequence<Text>;
}

/**
 * Options for grouping text descendants.
 *
 * @public
 */
export interface TextGroupOptions<N extends BaseNode = BaseNode> {
  startsGroup: Refinement<BaseNode, N>;
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
export function getTextDescendants<N extends BaseNode = BaseNode>(
  textOptions: TextGroupOptions<N> = defaultTextOptions,
): (
  node: BaseNode,
  options?: BaseNode.Traversal,
) => Sequence<Text | TextGroup> {
  return (node, options = BaseNode.Traversal.empty) => {
    const optionsMap = _textCache
      .get(textOptions, Cache.empty)
      .get(node, () => []);

    if (optionsMap[options.value] === undefined) {
      optionsMap[options.value] = Sequence.from(
        _getTextDescendants(node, textOptions, options),
      );
    }

    return optionsMap[options.value];
  };
}

function* _getTextDescendants<N extends BaseNode = BaseNode>(
  node: BaseNode,
  textOptions: TextGroupOptions<N>,
  traversalOptions: BaseNode.Traversal,
): Generator<Text | TextGroup> {
  const { startsGroup, getLabel } = textOptions;

  for (const child of node.children(traversalOptions)) {
    if (startsGroup(child)) {
      const groupText = getDescendants(Text.isText)(child, traversalOptions);
      yield {
        node: child,
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
