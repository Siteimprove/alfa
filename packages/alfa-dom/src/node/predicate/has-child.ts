import { Predicate } from "@siteimprove/alfa-predicate";

import { Node } from "../../node";

/**
 * @public
 */
export function hasChild(
  predicate: Predicate<Node>,
  options: Node.Traversal = Node.Traversal.empty
): Predicate<Node> {
  return (node) => node.children(options).some(predicate);
}
