import { Predicate } from "@siteimprove/alfa-predicate";

import { Node } from "../../node";

export function hasChild(
  predicate: Predicate<Node>,
  options: Node.Traversal = {}
): Predicate<Node> {
  return (node) => node.children(options).some(predicate);
}
