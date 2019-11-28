import { Node } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";

const { some } = Iterable;

export function hasChild(
  predicate: Predicate<Node>,
  options: Node.Traversal = {}
): Predicate<Node> {
  return node => some(node.children(options), predicate);
}
