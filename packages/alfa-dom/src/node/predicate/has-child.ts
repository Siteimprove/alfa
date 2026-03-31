import type { Predicate } from "@siteimprove/alfa-predicate";

import type { Node } from "../index.js";
import { BaseNode } from "../node.js";

/**
 * @public
 */
export function hasChild(
  predicate: Predicate<Node>,
  options: Node.Traversal = BaseNode.Traversal.empty,
): Predicate<Node> {
  return (node) => node.children(options).some(predicate);
}
