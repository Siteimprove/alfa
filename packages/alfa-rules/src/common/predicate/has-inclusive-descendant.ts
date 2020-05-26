import { Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasInclusiveDescendant(
  predicate: Predicate<Node>,
  options: Node.Traversal = {}
): Predicate<Node> {
  return (node) => node.inclusiveDescendants(options).some(predicate);
}
