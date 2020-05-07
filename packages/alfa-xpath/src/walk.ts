import { Element, Node } from "@siteimprove/alfa-dom";

import { Expression } from "./expression";

/**
 * @internal
 */
export function* walk(
  node: Node,
  axis: Expression.Axis.Type,
  options: Node.Traversal = {}
): Iterable<Node> {
  switch (axis) {
    case "self":
      return yield node;

    case "child":
      return yield* node.children(options);

    case "parent":
      return yield* node.parent(options);

    case "descendant":
      return yield* node.descendants(options);

    case "descendant-or-self":
      yield node;
      return yield* node.descendants(options);

    case "ancestor":
      return yield* node.ancestors(options);

    case "ancestor-or-self":
      yield node;
      return yield* node.ancestors(options);

    case "attribute":
      if (Element.isElement(node)) {
        yield* node.attributes;
      }
  }
}
