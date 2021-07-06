import { Element, Node } from "@siteimprove/alfa-dom";
import { Device } from "@siteimprove/alfa-device";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Option, None } from "@siteimprove/alfa-option";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Sequence } from "@siteimprove/alfa-sequence";

import { isPerceivable, isReplaced } from "../predicate";

const { equals, or, test } = Predicate;
const { and } = Refinement;

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
export function getContentBetween(
  node1: Node,
  node2: Node,
  device: Device = Device.standard(),
  includeOptions: Options = { includeFirst: false, includeSecond: false }
): Sequence<Node> {
  const treeOptions = { flattened: true, nested: true };

  if (node2.equals(node1)) {
    return includeOptions.includeFirst && includeOptions.includeSecond
      ? Sequence.from([node1])
      : Sequence.empty();
  }

  const isFrontier = or(equals(node1), equals(node2));
  const context = lowestCommonAncestor(node1, node2, treeOptions);

  if (context.isNone()) {
    // the nodes are not even in the same tree…
    return Sequence.empty();
  }

  // Get descendants of the LCA, and skip everything before and after both nodes.
  // Due to first test, descendants contains at least two nodes: node1 and node2
  let descendants = context
    .get()
    .inclusiveDescendants(treeOptions)
    .skipUntil(isFrontier)
    .skipLastUntil(isFrontier);

  const first = descendants.first().get();

  // If the first node should be included, we're done;
  // otherwise, we need to skip its subtree.
  if (includeOptions.includeFirst) {
    return descendants;
  } else {
    return descendants
      .rest()
      .skipWhile((node) => node.ancestors(treeOptions).includes(first));
  }
}

/**
 * Checks if there is perceivable content between two nodes. The relative
 * order of the nodes is unknown. Options let it choose whether the first
 * or second node (in tree order) should be included. By default, exclude both.
 *
 * When the first node is not included, all its subtree is skipped, that is we
 * start looking after the closing tag, not after the opening one.
 *
 * Returns false in the corner case where both nodes are the same and at least
 * one is excluded (i.e. considers that [X,X[ and ]X,X] are empty).
 *
 * Perceivable containers (e.g. <div><span>Hello</span></div>) are not
 * considered as perceivable content here, only perceivable actual content is.
 *
 * Complexity: the size of the subtree anchored at the lowest common ancestor.
 */
export function hasContentBetween(
  node1: Node,
  node2: Node,
  device: Device = Device.standard(),
  includeOptions: Options = { includeFirst: false, includeSecond: false }
): boolean {
  const treeOptions = { flattened: true, nested: true };
  const isPerceivableContent = and(
    isPerceivable(device),
    isContent(treeOptions)
  );

  const between = getContentBetween(node1, node2, device, includeOptions);

  return between.find(isPerceivableContent).isSome();
}

type Options = {
  includeFirst: boolean;
  includeSecond: boolean;
};

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

/**
 * A node is actual content (not just a container) if it has no children,
 * or if it is a replaced element (assumed to be replaced by actual content).
 */
function isContent(options: Node.Traversal = {}): Predicate<Node> {
  return or(
    (node) => node.children(options).isEmpty(),
    and(Element.isElement, isReplaced)
  );
}
