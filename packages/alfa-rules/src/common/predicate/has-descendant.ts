import { contains, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasDescendant<T extends Node>(
  context: Node,
  predicate: Predicate<Node, T>,
  options: contains.Options = {}
): Predicate<Node> {
  return node => contains(node, context, predicate, options);
}
