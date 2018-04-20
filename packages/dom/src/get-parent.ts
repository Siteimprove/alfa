import { Node } from "./types";
import { traverse } from "./traverse";

const parentTrees: WeakMap<Node, ParentTree> = new WeakMap();

export function getParent(node: Node, context: Node): Node | null {
  let parentTree = parentTrees.get(context);

  if (parentTree === undefined) {
    parentTree = new ParentTree(context);
    parentTrees.set(context, parentTree);
  }

  return parentTree.get(node);
}

/**
 * @see https://en.wikipedia.org/wiki/Parent_pointer_tree
 */
class ParentTree {
  /**
   * Instead of storing the parent tree as a literal tree of parent pointers,
   * we instead use a map in order to provide indexed access to nodes.
   */
  private _pointers: Map<Node, Node> = new Map();

  public constructor(context: Node) {
    traverse(
      context,
      (node, parent) => {
        if (parent !== null) {
          this._pointers.set(node, parent);
        }
      },
      { composed: true }
    );
  }

  public get(node: Node): Node | null {
    const parent = this._pointers.get(node);

    if (parent === undefined) {
      return null;
    }

    return parent;
  }
}
