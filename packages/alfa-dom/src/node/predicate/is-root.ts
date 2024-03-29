import { Predicate } from "@siteimprove/alfa-predicate";

import { Node } from "../../node";

/**
 * @public
 */
export function isRoot(options?: Node.Traversal): Predicate<Node> {
  return (node) => node.parent(options).isNone();
}
