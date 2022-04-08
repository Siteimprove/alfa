import { Node } from "../..";
import { None, Option } from "@siteimprove/alfa-option";

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
  node1: Node,
  node2: Node,
  options: Node.Traversal = {}
): Option<Node> {
  return node1
    .inclusiveAncestors(options)
    .reverse()
    .zip(node2.inclusiveAncestors(options).reverse())
    .reduceWhile<Option<Node>>(
      ([first1, first2]) => first1.equals(first2),
      (_, [node]) => Option.of(node),
      None
    );
}
