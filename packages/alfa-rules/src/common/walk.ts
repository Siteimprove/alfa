import { Node, traverseNode } from "@siteimprove/alfa-dom";

export function walk(
  scope: Node,
  context: Node,
  options: traverseNode.Options = {}
): Iterable<Node> {
  return traverseNode(
    scope,
    context,
    {
      *enter(node) {
        yield node;
      }
    },
    options
  );
}
