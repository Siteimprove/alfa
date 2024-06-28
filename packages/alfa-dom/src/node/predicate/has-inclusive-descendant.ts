import type { Predicate } from "@siteimprove/alfa-predicate";

import { Node } from "../../node.js";

/**
 * @public
 */
export function hasInclusiveDescendant(
  predicate: Predicate<Node>,
  options: Node.Traversal = Node.Traversal.empty,
): Predicate<Node> {
  return (node) => node.inclusiveDescendants(options).some(predicate);
}
