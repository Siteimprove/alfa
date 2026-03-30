import { None, Option } from "@siteimprove/alfa-option";

import type { BaseNode } from "../node.js";

/**
 * Find the lowest common ancestor of two nodes:
 * * get the ancestors chain of both
 * * go down the chain, from root to nodes, as long as it is the same node
 *
 * Complexity: linear in the depth of the nodes.
 *
 * @internal
 */
export function lowestCommonAncestor(
  defaultTraversal: BaseNode.Traversal,
): (
  node1: BaseNode,
  node2: BaseNode,
  options?: BaseNode.Traversal,
) => Option<BaseNode> {
  return (node1, node2, options = defaultTraversal) =>
    node1
      .inclusiveAncestors(options)
      .reverse()
      .zip(node2.inclusiveAncestors(options).reverse())
      .reduceWhile<Option<BaseNode>>(
        ([first1, first2]) => first1.equals(first2),
        (_, [node]) => Option.of(node),
        None,
      );
}
