import { Array } from "@siteimprove/alfa-array";
import { Cache } from "@siteimprove/alfa-cache";
import { None, Option } from "@siteimprove/alfa-option";
import type { Predicate } from "@siteimprove/alfa-predicate";
import { Sequence } from "@siteimprove/alfa-sequence";

import { Node } from "../../node.js";
import { Text } from "../text.js";

const _groupedTextCache = Cache.empty<
  Predicate<Node>,
  Cache<(node: Node) => string, Cache<Node, Array<Sequence<Text | TextGroup>>>>
>();

/**
 * A group of text nodes with an associated label.
 *
 * @public
 */
export interface TextGroup {
  label: string;
  text: Array<Text>;
}

/**
 * Get text nodes and text groups from a node's descendants.
 *
 * @remarks
 * This function traverses the node tree and organizes text nodes into groups
 * based on the provided predicate. Nodes that satisfy the predicate start a new
 * group with a label. Text nodes encountered are added to the current group, or
 * added as top-level text nodes if no group is active.
 *
 * In order to properly cache results for improved performance, care must be taken
 * to use the exact same predicate and label function (JS objects) and not merely
 * clones of them.
 *
 * @public
 */
export function getGroupedText(
  startsGroup: Predicate<Node>,
  getLabel: (node: Node) => string,
): (node: Node, options?: Node.Traversal) => Sequence<Text | TextGroup> {
  return (node, options = Node.Traversal.empty) => {
    const labelMap = _groupedTextCache
      .get(startsGroup, Cache.empty)
      .get(getLabel, Cache.empty)
      .get(node, () => []);

    if (labelMap[options.value] === undefined) {
      labelMap[options.value] = computeGroupedText(
        node,
        options,
        startsGroup,
        getLabel,
      );
    }

    return labelMap[options.value];
  };
}

function computeGroupedText(
  node: Node,
  options: Node.Traversal,
  startsGroup: Predicate<Node>,
  getLabel: (node: Node) => string,
): Sequence<Text | TextGroup> {
    const result: Array<Text | TextGroup> = [];
    let currentGroup: Option<TextGroup> = None;

    for (const n of node.inclusiveDescendants(options)) {
      if (startsGroup(n)) {
        // If there is an active group, add it to result before starting a new.
        if (currentGroup.isSome()) {
          result.push(currentGroup.get());
        }

        const newGroup: TextGroup = {
          label: getLabel(n),
          text: [],
        };

        // If the group starting node is also a text node, add it to its own group.
        if (Text.isText(n)) {
          newGroup.text.push(n);
        }

        currentGroup = Option.of(newGroup);
      } else if (Text.isText(n)) {
        if (currentGroup.isSome()) {
          currentGroup.get().text.push(n);
        } else {
          // No active group, add text at top level
          result.push(n);
        }
      }
    }

  if (currentGroup.isSome() && !Array.isEmpty(currentGroup.get().text)) {
    result.push(currentGroup.get());
  }

  return Sequence.from(result);
}
