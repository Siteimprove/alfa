import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";
import { Node } from "./types";

type ParentMap = WeakMap<Node, Node>;

const flattenedParentMaps: WeakMap<Node, ParentMap> = new WeakMap();

const composedParentMaps: WeakMap<Node, ParentMap> = new WeakMap();

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
  options: Readonly<{ composed?: boolean; flattened?: boolean }> = {}
): Node | null {
  let parentMaps = composedParentMaps;

  if (options.flattened === true) {
    parentMaps = flattenedParentMaps;
  }

  let parentMap = parentMaps.get(context);

  if (parentMap === undefined) {
    parentMap = new WeakMap();

    traverseNode(
      context,
      context,
      {
        enter(node, parentNode) {
          if (parentNode !== null) {
            parentMap!.set(node, parentNode);
          }
        }
      },
      {
        composed: options.flattened !== true,
        flattened: options.flattened
      }
    );

    parentMaps.set(context, parentMap);
  }

  const parentNode = parentMap.get(node);

  if (parentNode === undefined) {
    return null;
  }

  if (
    options.composed !== true &&
    isElement(parentNode) &&
    parentNode.shadowRoot === node
  ) {
    return null;
  }

  return parentNode;
}
