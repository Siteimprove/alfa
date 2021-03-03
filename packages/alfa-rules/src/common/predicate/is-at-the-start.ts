import { Element, Node } from "@siteimprove/alfa-dom";
import { Device } from "@siteimprove/alfa-device";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Option, None } from "@siteimprove/alfa-option";
import { Refinement } from "@siteimprove/alfa-refinement";

import { isPerceivable } from "./is-perceivable";
import { isReplaced } from "./is-replaced";

const { and, equals, or, not, test } = Predicate;

/**
 * @see https://act-rules.github.io/glossary/#just-before
 *
 * ACT rules requires the second node to be perceivable content.
 * Since we cannot really enforce that at type level, and plan to use that with `<main>` as second node,
 * we extend the concept to "at the start":
 *
 * there is no perceivable *content* between the first (included) and second (excluded) of the nodes,
 * in tree order in the flat tree.
 *
 * Thus:
 * * [N1, …, N2] => N1 is at the start of N2 if there is no perceivable in [N1, …, N2[
 * * [N2, …, N1] => N1 is at the start of N2 if there is no perceivable in [N2, …, N1[
 * In both cases, jumping to N1 give access to all the perceivable nodes after N2, and no more.
 *
 * Perceivable containers (e.g. <div><span>Hello</span></div>) are actually OK, only perceivable actual content is bad.
 *
 * Note that the def is actually symmetrical, but N2 is conceptually a container (`<main>`)
 * while N1 is a single point (an anchor), hence the asymmetry in the code.
 *
 * Complexity: the size of the subtree anchored at the lowest common ancestor.
 **/
export function isAtTheStart(
  node2: Node,
  device: Device = Device.standard()
): Predicate<Node> {
  const options = { flattened: true, nested: true };
  const isPerceivableContent = and(isPerceivable(device), isContent(options));

  return function isAtTheStart(node1: Node): boolean {
    if (node2.equals(node1)) {
      return true;
    }

    const context = lowestCommonAncestor(node1, node2, {
      flattened: true,
      nested: true,
    });
    if (context.isNone()) {
      // the nodes are not even in the same tree…
      return false;
    }

    // Get descendants of the LCA, and skip everything before both nodes.
    let descendants = context.get().inclusiveDescendants(options);
    descendants = descendants.skipUntil(or(equals(node1), equals(node2)));

    // node1 and node2 cannot be equal due to first test, so if the first one is perceivable, this is bad.
    if (test(isPerceivableContent, descendants.first().get())) {
      return false;
    }

    // Go through descendants until we reach perceivable *content*, or the second of the nodes
    descendants = descendants.rest();
    descendants = descendants.skipUntil(
      or(isPerceivableContent, equals(node1), equals(node2))
    );

    // if we've found perceivable *content* which is not the second node, this is bad.
    // descendant cannot be empty because it contained at least node1 and node2 which are different.
    if (
      test(
        and(isPerceivableContent, not(or(equals(node1), equals(node2)))),
        descendants.first().get()
      )
    ) {
      return false;
    }

    return true;
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

/**
 * A node is actual content (not just a container) if it has no children,
 * or if it is a replaced element (assumed to be replaced by actual content).
 */
function isContent(options: Node.Traversal = {}): Predicate<Node> {
  return or(
    (node) => node.children(options).isEmpty(),
    Refinement.and(Element.isElement, isReplaced)
  );
}
