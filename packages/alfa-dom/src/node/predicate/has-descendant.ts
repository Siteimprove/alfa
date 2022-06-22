import { Predicate } from "@siteimprove/alfa-predicate";

import { Node } from "../../node";

/**
 * @public
 */
export function hasDescendant(
  predicate: Predicate<Node>,
  options: Node.Traversal = Node.Traversal.empty
): Predicate<Node> {
  return (node) => node.descendants(options).some(predicate);
}
