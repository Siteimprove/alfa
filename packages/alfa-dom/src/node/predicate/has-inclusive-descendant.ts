import { Predicate } from "@siteimprove/alfa-predicate";

import { Node } from "../../node";

export function hasInclusiveDescendant(
  predicate: Predicate<Node>,
  options: Node.Traversal = {}
): Predicate<Node> {
  return (node) => node.inclusiveDescendants(options).some(predicate);
}
