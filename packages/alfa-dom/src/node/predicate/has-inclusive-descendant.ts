import type { Predicate } from "@siteimprove/alfa-predicate";

import type { Node } from "../../node.js";

/**
 * @public
 */
export function hasInclusiveDescendant(
  defaultTraversal: Node.Traversal,
): (predicate: Predicate<Node>, options?: Node.Traversal) => Predicate<Node> {
  return (predicate, options = defaultTraversal) =>
    (node) =>
      node.inclusiveDescendants(options).some(predicate);
}
