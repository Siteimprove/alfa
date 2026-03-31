import type { Predicate } from "@siteimprove/alfa-predicate";

import type { Node } from "../index.ts";

/**
 * @public
 */
export function hasChild(
  defaultTraversal: Node.Traversal,
): (predicate: Predicate<Node>, options?: Node.Traversal) => Predicate<Node> {
  return (predicate, options = defaultTraversal) =>
    (node) =>
      node.children(options).some(predicate);
}
