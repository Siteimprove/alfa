import { Node } from "./types";
import { traverseNode } from "./traverse-node";
import { ParentTree } from "./parent-tree";

const parentTrees: WeakMap<Node, ParentTree<Node>> = new WeakMap();

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
  let parentTree = parentTrees.get(context);

  if (parentTree === undefined) {
    parentTree = new ParentTree();

    traverseNode(context, (node, parent) => {
      if (parent !== null && parentTree !== undefined) {
        parentTree.join(node, parent);
      }
    });

    parentTrees.set(context, parentTree);
  }

  return parentTree.get(node);
}
