import { Node } from "./types";
import { traverseNode } from "./traverse-node";

const parentMaps: WeakMap<Node, WeakMap<Node, Node>> = new WeakMap();

/**
 * Given a node and a context, get the parent of the node within the context.
 *
 * @see https://www.w3.org/TR/dom/#dom-node-parentnode
 *
 * @example
 * const span = <span />;
 * const div = <div>{span}</div>;
 * getParent(span, <section>{div}</section>);
 * // => <div>...</div>
 */
export function getParentNode(node: Node, context: Node): Node | null {
  let parentMap = parentMaps.get(context);

  if (parentMap === undefined) {
    parentMap = new WeakMap();

    traverseNode(context, {
      enter(node, parent) {
        if (parent !== null && parentMap !== undefined) {
          parentMap.set(node, parent);
        }
      }
    });

    parentMaps.set(context, parentMap);
  }

  return parentMap.get(node) || null;
}
