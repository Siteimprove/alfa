import { Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasChild(
  predicate: Predicate<Node>,
  options: Node.Traversal = {}
): Predicate<Node> {
  return (node) => node.children(options).some(predicate);
}
