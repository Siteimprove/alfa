import { getChildNodes, Node } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";

const { some } = Iterable;

export function hasChild<T extends Node>(
  context: Node,
  predicate: Predicate<Node, T>,
  options: getChildNodes.Options = {}
): Predicate<Node> {
  return node => some(getChildNodes(node, context, options), predicate);
}
