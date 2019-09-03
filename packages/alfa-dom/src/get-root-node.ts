import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";
import { Node } from "./types";

type RootMap = WeakMap<Node, Node>;

const normalRootMaps: WeakMap<Node, RootMap> = new WeakMap();

const flattenedRootMaps: WeakMap<Node, RootMap> = new WeakMap();

const composedRootMaps: WeakMap<Node, RootMap> = new WeakMap();

/**
 * Given a node and a context, get the root of the node within the context.
 *
 * @see https://dom.spec.whatwg.org/#dom-node-getrootnode
 */
export function getRootNode(
  node: Node,
  context: Node,
  options: getRootNode.Options = {}
): Node {
  let rootMaps = normalRootMaps;

  if (options.flattened === true) {
    rootMaps = flattenedRootMaps;
  } else if (options.composed === true) {
    rootMaps = composedRootMaps;
  }

  let rootMap = rootMaps.get(context);

  if (rootMap === undefined) {
    rootMap = new WeakMap();

    collectRootNodes(context, context, rootMap, options);

    rootMaps.set(context, rootMap);
  }

  const rootNode = rootMap.get(node);

  if (rootNode === undefined) {
    return node;
  }

  return rootNode;
}

export namespace getRootNode {
  export interface Options {
    readonly composed?: boolean;
    readonly flattened?: boolean;
  }
}

function collectRootNodes(
  root: Node,
  context: Node,
  rootMap: RootMap,
  options: getRootNode.Options
) {
  traverseNode(
    root,
    context,
    {
      enter(node) {
        rootMap.set(node, root);

        if (options.composed !== true && options.flattened !== true) {
          const shadowRoot = isElement(node) ? node.shadowRoot : null;

          // If a shadow root is encountered and we're looking for neither a
          // composed nor flattened root, recurse into the shadow root and mark
          // it as the root of itself and all its descendants.
          if (shadowRoot !== null && shadowRoot !== undefined) {
            collectRootNodes(shadowRoot, context, rootMap, options);
          }
        }
      }
    },
    { ...options, nested: true }
  );
}
