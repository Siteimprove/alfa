import { Node } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";

const { isEmpty } = Iterable;
const { not } = Predicate;

export function hasTextContent(
  predicate: Predicate<string> = not(isEmpty),
  options: Node.Traversal = {}
): Predicate<Node> {
  return node => predicate(node.textContent(options));
}
