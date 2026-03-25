import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";

import type { Node } from "../../node.js";

const { isEmpty } = Iterable;
const { not } = Predicate;

/**
 * @public
 */
export function hasTextContent(
  defaultTraversal: Node.Traversal,
): (
  predicate?: Predicate<string>,
  options?: Node.Traversal,
) => Predicate<Node> {
  return (predicate = not(isEmpty), options = defaultTraversal) =>
    (node) =>
      predicate(node.textContent(options));
}
