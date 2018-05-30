import { Node } from "./types";
import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";

const parentMaps: WeakMap<Node, WeakMap<Node, Node>> = new WeakMap();

/**
 * Given a node and a context, get the parent node of the node within the
 * context.
 *
 * @see https://www.w3.org/TR/dom/#dom-node-parentnode
 *
 * @example
 * const span = <span />;
 * const div = <div>{span}</div>;
 * getParent(span, <section>{div}</section>);
 * // => <div>...</div>
 */
export function getParentNode(
  node: Node,
  context: Node,
  options: { composed?: boolean } = {}
): Node | null {
  let parentMap = parentMaps.get(context);

  if (parentMap === undefined) {
    parentMap = new WeakMap();

    traverseNode(
      context,
      {
        enter(node, parentNode) {
          if (parentNode !== null && parentMap !== undefined) {
            parentMap.set(node, parentNode);
          }
        }
      },
      { composed: true }
    );

    parentMaps.set(context, parentMap);
  }

  const parentNode = parentMap.get(node);

  if (parentNode === undefined) {
    return null;
  }

  if (
    isElement(parentNode) &&
    options.composed !== true &&
    parentNode.shadowRoot === node
  ) {
    return null;
  }

  return parentNode;
}
