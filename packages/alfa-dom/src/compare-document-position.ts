import { getParentNode } from "./get-parent-node";
import { Node } from "./types";

export const enum DocumentPosition {
  /**
   * @see https://www.w3.org/TR/dom/#dom-node-document_position_disconnected
   */
  Disconnected = 1,

  /**
   * @see https://www.w3.org/TR/dom/#dom-node-document_position_preceding
   */
  Preceding = 2,

  /**
   * @see https://www.w3.org/TR/dom/#dom-node-document_position_following
   */
  Following = 4,

  /**
   * @see https://www.w3.org/TR/dom/#dom-node-document_position_contains
   */
  Contains = 8,

  /**
   * @see https://www.w3.org/TR/dom/#dom-node-document_position_contained_by
   */
  ContainedBy = 16,

  /**
   * @see https://www.w3.org/TR/dom/#dom-node-document_position_implementation_specific
   */
  ImplementationSpecific = 32
}

/**
 * Compare the position of a reference node with the position of another node.
 *
 * NB: Unlike `Node.compareDocumentPosition()` as specified in DOM, this
 * function also changes the sign of the returned number in order to allow use
 * as a normal comparison function passed to e.g. the native `Array.sort()`. As
 * such, `DocumentPosition.Following` will result in a negative sign while
 * `DocumentPosition.Preceding` will result in a positive sign. Do note that
 * when the result is `DocumentPosition.Disconnected`, a positive sign is used.
 *
 * @see https://www.w3.org/TR/dom/#dom-node-comparedocumentposition
 */
export function compareDocumentPosition(
  reference: Node,
  other: Node,
  context: Node,
  options: Readonly<{ composed?: boolean; flattened?: boolean }> = {}
): number {
  if (reference === other) {
    return 0;
  }

  const referencePath = getPathFromRoot(reference, context, options);
  const otherPath = getPathFromRoot(other, context, options);

  // Find the point at which the two paths fork, i.e. the index of the lowest
  // common ancestor of the two nodes.
  const forkingPoint = getForkingPoint(referencePath, otherPath);

  // If the two nodes to not share any parent nodes then the nodes are not in
  // the same tree.
  if (forkingPoint === -1) {
    const referenceOrdering = getImplementationSpecificOrdering(reference);
    const otherOrdering = getImplementationSpecificOrdering(other);

    return (
      DocumentPosition.Disconnected |
      DocumentPosition.ImplementationSpecific |
      (referenceOrdering > otherOrdering
        ? DocumentPosition.Following
        : DocumentPosition.Preceding)
    );
  }

  // If the reference node is the lowest common ancestor of the two nodes then
  // the other node is contained by the reference node.
  if (reference === referencePath[forkingPoint]) {
    return -1 * (DocumentPosition.ContainedBy | DocumentPosition.Following);
  }

  // If the other node is the lowest common ancestor of the two nodes then the
  // other node contains the reference node.
  if (other === otherPath[forkingPoint]) {
    return DocumentPosition.Contains | DocumentPosition.Preceding;
  }

  // For each of the two nodes, find the node directly after the lowest common
  // ancestor. This node will be unique to each of the two nodes as the lowest
  // common ancestor is the first node they share; the nodes directly after this
  // they do therefore not share. For example, consider the following tree:
  //
  // div
  // +-- em
  // +-- span
  // |   +-- #reference
  // +-- p
  //     +-- #other
  //
  // In the case above, the lowest common ancestor would be "div" while the new
  // reference node would be "span" and the new other node would be "p".
  reference = referencePath[forkingPoint + 1];
  other = otherPath[forkingPoint + 1];

  const { childNodes } = referencePath[forkingPoint];

  // Go through the children of the lowest common ancestor and see which of the
  // above nodes is encountered first. Building on the example above, the first
  // encountered node would be "span".
  for (let i = 0, n = childNodes.length; i < n; i++) {
    const child = childNodes[i];

    // If the reference node is encountered first then other node is following
    // the reference node.
    if (child === reference) {
      return -1 * DocumentPosition.Following;
    }

    // If the other node is encountered first the the other node is preceeding
    // the reference node.
    if (child === other) {
      return DocumentPosition.Preceding;
    }
  }

  return 0;
}

function getPathFromRoot(
  node: Node,
  context: Node,
  options: Readonly<{ composed?: boolean; flattened?: boolean }> = {}
): Array<Node> {
  const pathFromRoot: Array<Node> = [];

  for (
    let next: Node | null = node;
    next !== null;
    next = getParentNode(next, context, options)
  ) {
    pathFromRoot.unshift(next);
  }

  return pathFromRoot;
}

function getForkingPoint<T>(first: Array<T>, second: Array<T>): number {
  let forkingPoint = -1;

  for (let i = 0, n = Math.min(first.length, second.length); i < n; i++) {
    if (first[i] !== second[i]) {
      break;
    }

    forkingPoint = i;
  }

  return forkingPoint;
}

// For nodes that are disconnected we maintain a cache with arbitrary orderings
// assigned. This ensures that we maintain the constraint that implementation
// specific orderings for disconnected nodes should be consistent, i.e. if
// "foo" and "bar" are disconnected, "foo" compared to "bar" will return the
// opposite ordering of "bar" compared to "foo".
const orderings: WeakMap<Node, number> = new WeakMap();

function getImplementationSpecificOrdering(node: Node): number {
  let ordering = orderings.get(node);

  if (ordering === undefined) {
    ordering = Math.random();
    orderings.set(node, ordering);
  }

  return ordering;
}
