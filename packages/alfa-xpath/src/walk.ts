import { Element, Node } from "@siteimprove/alfa-dom";

import { Axis } from "./types";

/**
 * @internal
 */
export function* walk(
  node: Node,
  axis: Axis,
  options: Node.Traversal = {}
): Iterable<Node> {
  switch (axis) {
    case "self":
      yield node;
      break;

    case "child":
      yield* node.children(options);
      break;

    case "parent":
      yield* node.parent(options);
      break;

    case "descendant":
      yield* node.descendants(options);
      break;

    case "descendant-or-self":
      yield node;
      yield* node.descendants(options);
      break;

    case "ancestor":
      yield* node.ancestors(options);
      break;

    case "ancestor-or-self":
      yield node;
      yield* node.ancestors(options);
      break;

    case "attribute":
      if (Element.isElement(node)) {
        yield* node.attributes;
      }
  }
}
