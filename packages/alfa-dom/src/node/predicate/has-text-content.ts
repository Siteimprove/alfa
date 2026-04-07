import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";

import type { Node } from "../index.ts";
import { BaseNode } from "../node.js";

const { isEmpty } = Iterable;
const { not } = Predicate;

/**
 * @public
 */
export function hasTextContent(
  predicate: Predicate<string> = not(isEmpty),
  options: Node.Traversal = BaseNode.Traversal.empty,
): Predicate<Node> {
  return (node) => predicate(node.textContent(options));
}
