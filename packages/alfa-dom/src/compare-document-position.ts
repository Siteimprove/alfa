import { Node } from "./types";
import { getParentNode } from "./get-parent-node";

export const enum DocumentPosition {
  /**
   * @see https://www.w3.org/TR/dom/#dom-node-document_position_disconnected
   */
  Disconnected = 1,

  /**
   * @see https://www.w3.org/TR/dom/#dom-node-document_position_preceding
   */
  Preceding = 1 << 1,

  /**
   * @see https://www.w3.org/TR/dom/#dom-node-document_position_following
   */
  Following = 1 << 2,

  /**
   * @see https://www.w3.org/TR/dom/#dom-node-document_position_contains
   */
  Contains = 1 << 3,

  /**
   * @see https://www.w3.org/TR/dom/#dom-node-document_position_contained_by
   */
  ContainedBy = 1 << 4,

  /**
   * @see https://www.w3.org/TR/dom/#dom-node-document_position_implementation_specific
   */
  ImplementationSpecific = 1 << 5
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
  context: Node
): number {
  if (reference === other) {
    return 0;
  }

  const referencePath = getPathFromRoot(reference, context);
  const otherPath = getPathFromRoot(other, context);

  const forkingPoint = getForkingPoint(referencePath, otherPath);

  if (forkingPoint === -1) {
    return (
      DocumentPosition.Disconnected | DocumentPosition.ImplementationSpecific
    );
  }

  if (reference === referencePath[forkingPoint]) {
    return -1 * (DocumentPosition.ContainedBy | DocumentPosition.Following);
  }

  if (other === otherPath[forkingPoint]) {
    return DocumentPosition.Contains | DocumentPosition.Preceding;
  }

  const { childNodes } = referencePath[forkingPoint];

  reference = referencePath[forkingPoint + 1];
  other = otherPath[forkingPoint + 1];

  for (let i = 0, n = childNodes.length; i < n; i++) {
    const child = childNodes[i];

    if (child === reference) {
      return -1 * DocumentPosition.Following;
    }

    if (child === other) {
      return DocumentPosition.Preceding;
    }
  }

  return 0;
}

function getPathFromRoot(node: Node, context: Node): Array<Node> {
  const pathFromRoot: Array<Node> = [];

  for (
    let next: Node | null = node;
    next;
    next = getParentNode(next, context, { composed: true })
  ) {
    pathFromRoot.unshift(next);
  }

  return pathFromRoot;
}

function getForkingPoint(first: Array<any>, second: Array<any>): number {
  let forkingPoint = -1;

  for (let i = 0, n = Math.min(first.length, second.length); i < n; i++) {
    if (first[i] !== second[i]) {
      break;
    }

    forkingPoint = i;
  }

  return forkingPoint;
}
