import { getDocumentPosition } from "./get-document-position";
import { traverseNode } from "./traverse-node";
import { Node } from "./types";

type NodeList = Array<Node>;

const normalNodeLists: WeakMap<Node, NodeList> = new WeakMap();

const flattenedNodeLists: WeakMap<Node, NodeList> = new WeakMap();

const composedNodeLists: WeakMap<Node, NodeList> = new WeakMap();

/**
 * Given a context and a document position, get the node at the given document
 * position within the context. If no node exists within the context at the
 * given document position then `null` is returned.
 */
export function getNode(
  context: Node,
  documentPosition: number,
  options: getNode.Options = {}
): Node | null {
  let nodeLists = normalNodeLists;

  if (options.flattened === true) {
    nodeLists = flattenedNodeLists;
  } else if (options.composed === true) {
    nodeLists = composedNodeLists;
  }

  let nodeList = nodeLists.get(context);

  if (nodeList === undefined) {
    nodeList = [];

    traverseNode(
      context,
      context,
      {
        enter(node) {
          nodeList![getDocumentPosition(node, context, options)!] = node;
        }
      },
      { ...options, nested: false }
    );

    nodeLists.set(context, nodeList);
  }

  if (documentPosition in nodeList === false) {
    return null;
  }

  return nodeList[documentPosition];
}

export namespace getNode {
  export interface Options {
    readonly composed?: boolean;
    readonly flattened?: boolean;
  }
}
