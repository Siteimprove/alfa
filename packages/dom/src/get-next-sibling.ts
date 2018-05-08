import { Predicate } from "@alfa/util";
import { Node } from "./types";
import { getParentNode } from "./get-parent-node";

const siblingMaps: WeakMap<Node, WeakMap<Node, Node | null>> = new WeakMap();

/**
 * @see https://www.w3.org/TR/dom/#dom-node-nextsibling
 */
export function getNextSibling<T extends Node>(
  node: Node,
  context: Node
): Node | null {
  let siblingMap = siblingMaps.get(context);

  if (siblingMap === undefined) {
    siblingMap = new WeakMap();
    siblingMaps.set(context, siblingMap);
  }

  let sibling = siblingMap.get(node);

  if (sibling === undefined) {
    const parentNode = getParentNode(node, context);

    if (parentNode === null) {
      sibling = null;
    } else {
      const { childNodes } = parentNode;

      for (let i = 0, n = childNodes.length; i < n; i++) {
        siblingMap.set(childNodes[i], childNodes[i + 1] || null);
      }

      sibling = siblingMap.get(node)!;
    }
  }

  return sibling;
}
