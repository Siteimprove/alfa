import { Node } from "./types";
import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";

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
  options: { composed?: boolean; flattened?: boolean } = {}
): Node | null {
  let parentMap: ParentMap | undefined;

  if (options.flattened) {
    parentMap = flattenedParentMaps.get(context);
  } else {
    parentMap = composedParentMaps.get(context);
  }

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
      {
        composed: !options.flattened,
        flattened: options.flattened
      }
    );

    if (options.flattened) {
      flattenedParentMaps.set(context, parentMap);
    } else {
      composedParentMaps.set(context, parentMap);
    }
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
