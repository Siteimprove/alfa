import { Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Option, None } from "@siteimprove/alfa-option";

/**
 * @see https://act-rules.github.io/glossary/#just-before
 *
 * ACT rules requires the second node to be perceivable content.
 * Since we cannot really enforce that at type level, and plan to use that with `<main>` as second node,
 * we extend the concept to "at the start":
 *
 * there is no perceivable content between the first (included) and second (excluded) of the nodes,
 * in tree order in the flat tree.
 *
 * Thus:
 * * [N1, …, N2] => N1 is at the start of N2 if there is no perceivable in [N1, …, N2[
 * * [N2, …, N1] => N1 is at the start of N2 if there is no perceivable in [N2, …, N1[
 * In both cases, jumping to N1 give access to all the perceivable nodes after N2, and no more.
 **/
export function isAtTheStart(node1: Node): Predicate<Node> {
  return function atTheStart(node2: Node): boolean {
    if (node2.equals(node1)) {
      return true;
    }
    return false;
  };
}

/**
 * @internal
 *
 * Find the lowest common ancestor of two nodes:
 * * get the ancestors chain of both
 * * go down the chain, from root to nodes, as long as it is the same node
 * Complexity: linear in the depth of the nodes.
 */
export function lowestCommonAncestor(
  node1: Node,
  node2: Node,
  options: Node.Traversal = {}
): Option<Node> {
  // Ancestors, from root to nodes.
  let ancestors1 = node1.inclusiveAncestors(options).reverse();
  let ancestors2 = node2.inclusiveAncestors(options).reverse();

  // Going down the tree as long as the node is ancestor to both nodes
  let commonAncestor: Option<Node> = None;
  let next1 = ancestors1.first();
  let next2 = ancestors2.first();
  while (next1.equals(next2)) {
    commonAncestor = next1;
    ancestors1 = ancestors1.rest();
    next1 = ancestors1.first();
    ancestors2 = ancestors2.rest();
    next2 = ancestors2.first();

    if (next1.isNone() || next2.isNone()) {
      // This is needed for the corner case of nodes in different trees but at the exact same depth…
      break;
    }
  }

  return commonAncestor;
}
