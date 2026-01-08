import { Cache } from "@siteimprove/alfa-cache";
import type { Predicate } from "@siteimprove/alfa-predicate";
import type { Refinement } from "@siteimprove/alfa-refinement";
import { Sequence } from "@siteimprove/alfa-sequence";

import { Node } from "../../node.js";
import { Element } from "../element.js";
import { Text } from "../text.js";

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

const _textCache = Cache.empty<
  TextGroupOptions,
  Cache<Node, Array<Sequence<Text | TextGroup>>>
>();

/**
 * A group of text nodes with an associated label.
 *
 * @public
 */
export interface TextGroup {
  label: string;
  text: Sequence<Text>;
}

/**
 * Options for grouping text descendants.
 *
 * @public
 */
export interface TextGroupOptions {
  startsGroup: Predicate<Node>;
  getLabel: (node: Node) => string;
}

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
export function getTextDescendants(
  textOptions: TextGroupOptions = {
    startsGroup: () => false,
    getLabel: () => "",
  },
): (node: Node, options?: Node.Traversal) => Sequence<Text | TextGroup> {
  return (node, options = Node.Traversal.empty) => {
    const optionsMap = _textCache
      .get(textOptions, Cache.empty)
      .get(node, () => []);

    if (optionsMap[options.value] === undefined) {
      const result: Array<Text | TextGroup> = [];

      function visit(node: Node) {
        const { startsGroup, getLabel } = textOptions;

        for (const child of node.children(options)) {
          if (startsGroup(child)) {
            const groupText = child
              .inclusiveDescendants(options)
              .filter(Text.isText);

            result.push({
              label: getLabel(child),
              text: groupText,
            });
          } else if (Text.isText(child)) {
            result.push(child);
          } else {
            visit(child);
          }
        }
      }

      visit(node);

      optionsMap[options.value] = Sequence.from(result);
    }

    return optionsMap[options.value];
  };
}
