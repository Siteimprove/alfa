import type { Predicate } from "@siteimprove/alfa-predicate";

import type { Node } from "../index.ts";
import { BaseNode } from "../node.js";

/**
 * @public
 */
export function hasDescendant(
  predicate: Predicate<Node>,
  options: Node.Traversal = BaseNode.Traversal.empty,
): Predicate<Node> {
  return (node) => node.descendants(options).some(predicate);
}
