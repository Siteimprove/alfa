import type { Predicate } from "@siteimprove/alfa-predicate";

import type { Node } from "../../node.js";

/**
 * @public
 */
export function isRoot(options?: Node.Traversal): Predicate<Node> {
  return (node) => node.parent(options).isNone();
}
