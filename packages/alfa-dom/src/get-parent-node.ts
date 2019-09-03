import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";
import { Node } from "./types";

type ParentMap = WeakMap<Node, Node>;

const flattenedParentMaps: WeakMap<Node, ParentMap> = new WeakMap();

const composedParentMaps: WeakMap<Node, ParentMap> = new WeakMap();

/**
 * Given a node and a context, get the parent of the node within the context.
 * If the node has no parent, `null` is returned.
 *
 * @see https://www.w3.org/TR/dom/#dom-node-parentnode
 *
 * @example
 * const span = <span />;
 * const div = <div>{span}</div>;
 * getParentNode(span, <section>{div}</section>);
 * // => <div>...</div>
 */
export function getParentNode(
  node: Node,
  context: Node,
  options: getParentNode.Options = {}
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
        flattened: options.flattened,
        nested: true
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

export namespace getParentNode {
  export interface Options {
    readonly composed?: boolean;
    readonly flattened?: boolean;
  }
}
