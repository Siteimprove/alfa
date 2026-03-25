import type { Predicate } from "@siteimprove/alfa-predicate";

import type { Node } from "../node.js";

/**
 * @public
 */
export function hasDescendant(
  defaultTraversal: Node.Traversal,
): (predicate: Predicate<Node>, options?: Node.Traversal) => Predicate<Node> {
  return (predicate, options = defaultTraversal) =>
    (node) =>
      node.descendants(options).some(predicate);
}
