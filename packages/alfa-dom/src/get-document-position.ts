import { traverseNode } from "./traverse-node";
import { Node } from "./types";

type PositionMap = WeakMap<Node, number>;

const normalPositionMaps: WeakMap<Node, PositionMap> = new WeakMap();

const flattenedPositionMaps: WeakMap<Node, PositionMap> = new WeakMap();

const composedPositionMaps: WeakMap<Node, PositionMap> = new WeakMap();

/**
 * Given a node and a context, get the document position of the node within the
 * context. If the node does not exist within the given context then `-1` is
 * returned.
 */
export function getDocumentPosition(
  node: Node,
  context: Node,
  options: Readonly<{ composed?: boolean; flattened?: boolean }> = {}
): number {
  let positionMaps = normalPositionMaps;

  if (options.flattened === true) {
    positionMaps = flattenedPositionMaps;
  } else if (options.composed === true) {
    positionMaps = composedPositionMaps;
  }

  let positionMap = positionMaps.get(context);

  if (positionMap === undefined) {
    positionMap = new WeakMap();

    let position = 0;

    traverseNode(
      context,
      context,
      {
        enter(node) {
          positionMap!.set(node, position++);
        }
      },
      options
    );

    positionMaps.set(context, positionMap);
  }

  const position = positionMap.get(node);

  if (position === undefined) {
    return -1;
  }

  return position;
}
