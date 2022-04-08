import { Predicate } from "@siteimprove/alfa-predicate";

import { Node } from "../../node";

/**
 * @public
 */
export function hasDescendant(
  predicate: Predicate<Node>,
  options: Node.Traversal = {}
): Predicate<Node> {
  return (node) => node.descendants(options).some(predicate);
}
