import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Node } from "../../node";

const { isEmpty } = Iterable;
const { not } = Predicate;

export function hasTextContent(
  predicate: Predicate<string> = not(isEmpty),
  options: Node.Traversal = {}
): Predicate<Node> {
  return (node) => predicate(node.textContent(options));
}
