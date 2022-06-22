import { Predicate } from "@siteimprove/alfa-predicate";

import { Node } from "../../node";

/**
 * @public
 */
export function hasInclusiveDescendant(
  predicate: Predicate<Node>,
  options: Node.Traversal = Node.Traversal.empty
): Predicate<Node> {
  return (node) => node.inclusiveDescendants(options).some(predicate);
}
