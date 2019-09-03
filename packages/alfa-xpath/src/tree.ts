import {
  Attribute,
  isElement,
  Node,
  traverseNode
} from "@siteimprove/alfa-dom";
import { Mutable } from "@siteimprove/alfa-util";
import { Axis } from "./types";

/**
 * The tree is a data structure used for representing a tree of DOM nodes that
 * can be navigated by an XPath evaluator. The purpose of the tree is to provide
 * constant time access to any of the axes that an XPath evaluator might wish to
 * walk. To do so, each node in the tree provides pointers to its parent,
 * children, and siblings, unlike DOM nodes which only provide pointers to their
 * children.
 *
 * @internal
 */
export interface Tree<T extends Node = Node> {
  readonly node: T;
  readonly context: Node;
  readonly parent: Tree | null;
  readonly prev: Tree | null;
  readonly next: Tree | null;
  readonly children: Array<Tree>;
  readonly attributes: Array<Tree<Attribute>>;
}

/**
 * @internal
 */
export function* walkTree(tree: Tree, axis: Axis): Iterable<Tree> {
  let queue: Array<Tree>;

  switch (axis) {
    case "self":
    case "descendant-or-self":
    case "ancestor-or-self":
      queue = [tree];
      break;

    case "child":
    case "descendant":
      queue = [...tree.children];
      break;

    case "attribute":
      queue = [...tree.attributes];
      break;

    case "parent":
    case "ancestor":
      queue = tree.parent === null ? [] : [tree.parent];
      break;

    default:
      queue = [];
  }

  let next = queue.shift();

  while (next !== undefined) {
    yield next;

    switch (axis) {
      case "descendant":
      case "descendant-or-self":
        for (let i = next.children.length - 1; i >= 0; i--) {
          queue.unshift(next.children[i]);
        }
        break;

      case "ancestor":
      case "ancestor-or-self":
        if (next.parent !== null) {
          queue.push(next.parent);
        }
    }

    next = queue.shift();
  }
}

/**
 * @internal
 */
export function getTree<T extends Node>(
  scope: T,
  context: Node,
  options: getTree.Options = {}
): Tree<T> | null {
  let entry: Tree | null = null;

  const parents: Array<Tree> = [];

  traverseNode(
    context,
    context,
    {
      enter(node) {
        const parent = last(parents);

        const tree: Mutable<Tree> = {
          node,
          context,
          parent,
          prev: null,
          next: null,
          children: [],
          attributes: []
        };

        parents.push(tree);

        if (scope === node) {
          entry = tree;
        }

        if (parent !== null) {
          const sibling = last(parent.children) as Mutable<Tree> | null;

          if (sibling !== null) {
            sibling.next = tree;
            tree.prev = sibling;
          }

          parent.children.push(tree);
        }

        if (isElement(node)) {
          tree.attributes = Array.from(node.attributes).map(attribute => {
            return {
              node: attribute,
              context,
              parent: tree,
              prev: null,
              next: null,
              children: [],
              attributes: []
            };
          });
        }
      },

      exit(node) {
        parents.pop();
      }
    },
    options
  );

  return entry;
}

/**
 * @internal
 */
export namespace getTree {
  export type Options = traverseNode.Options;
}

function last<T>(array: Array<T>): T | null {
  return array.length > 0 ? array[array.length - 1] : null;
}
