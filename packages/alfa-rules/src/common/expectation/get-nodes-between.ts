import { Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Sequence } from "@siteimprove/alfa-sequence";

import { lowestCommonAncestor } from "./lowest-common-ancestor";

const { equals, or } = Predicate;

const treeOptions = { flattened: true, nested: true };

/**
 * Get content between two nodes. The relative order of the nodes is unknown.
 * Options let it choose whether the first or second node (in tree order)
 * should be included. By default, exclude both.
 *
 * When the first node is not included, all its subtree is skipped, that is we
 * start looking after the closing tag, not after the opening one.
 *
 * Returns empty sequence in the corner case where both nodes are the same and
 * at least one is excluded (i.e. considers that [X,X[ and ]X,X] are empty).
 *
 * Complexity: the size of the subtree anchored at the lowest common ancestor.
 */
export function getNodesBetween(
  node1: Node,
  node2: Node,
  includeOptions: Options = { includeFirst: false, includeSecond: false }
): Sequence<Node> {
  let between = getNodesInclusivelyBetween(node1, node2);

  // If somehow there is nothing between them, escape now
  if (between.isEmpty()) {
    return between;
  }

  const first = between.first().get();

  // Do we keep the first node or skip its subtree?
  between = includeOptions.includeFirst
    ? between
    : between
        .rest()
        .skipWhile((node) => node.ancestors(treeOptions).includes(first));

  // Do we keep the second node or remove it?
  between =
    includeOptions.includeSecond || between.isEmpty()
      ? between
      : between.skipLast(1);

  return between;
}

/**
 * Get all nodes between node1 and node2, included.
 */
function getNodesInclusivelyBetween(node1: Node, node2: Node): Sequence<Node> {
  const isFrontier = or(equals(node1), equals(node2));

  // Get descendants of the LCA, and skip everything before and after both nodes.
  return lowestCommonAncestor(node1, node2, treeOptions)
    .map((context) =>
      context
        .inclusiveDescendants(treeOptions)
        .skipUntil(isFrontier)
        .skipLastUntil(isFrontier)
    )
    .getOrElse(Sequence.empty);
}

type Options = {
  includeFirst: boolean;
  includeSecond: boolean;
};
