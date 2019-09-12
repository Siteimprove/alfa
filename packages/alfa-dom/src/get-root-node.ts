import { Cache } from "@siteimprove/alfa-util";
import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";
import { Node } from "./types";

enum Mode {
  Normal,
  Composed,
  Flattened
}

const rootNodes = Cache.of<Mode, Cache<Node, Cache<Node, Node>>>({
  weak: false
});

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
  let mode = Mode.Normal;

  if (options.composed === true) {
    mode = Mode.Composed;
  }

  if (options.flattened === true) {
    mode = Mode.Flattened;
  }

  const rootNode = rootNodes
    .get(mode, Cache.of)
    .get(context, () => {
      return collectRootNodes(context, context, options);
    })
    .get(node);

  if (rootNode === null) {
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
  options: getRootNode.Options,
  rootNodes = Cache.of<Node, Node>()
): Cache<Node, Node> {
  traverseNode(
    root,
    context,
    {
      enter(node) {
        rootNodes.set(node, root);

        if (options.composed !== true && options.flattened !== true) {
          const shadowRoot = isElement(node) ? node.shadowRoot : null;

          // If a shadow root is encountered and we're looking for neither a
          // composed nor flattened root, recurse into the shadow root and mark
          // it as the root of itself and all its descendants.
          if (shadowRoot !== null && shadowRoot !== undefined) {
            collectRootNodes(shadowRoot, context, options, rootNodes);
          }
        }

        const contentDocument = isElement(node) ? node.contentDocument : null;

        if (contentDocument !== null && contentDocument !== undefined) {
          collectRootNodes(contentDocument, context, options, rootNodes);
        }
      }
    },
    { ...options, nested: false }
  );

  return rootNodes;
}
