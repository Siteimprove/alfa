import { Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasParent(
  predicate: Predicate<Node> = () => true,
  options: Node.Traversal = {}
): Predicate<Node> {
  return node => node.parent(options).some(predicate);
}
