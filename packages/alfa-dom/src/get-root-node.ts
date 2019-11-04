import { Cache } from "@siteimprove/alfa-cache";
import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";
import { Node } from "./types";

enum Mode {
  Normal,
  Composed,
  Flattened
}

const cache = Cache.empty<Mode, Cache<Node, Cache<Node, Node>>>();

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

  return cache
    .get(mode, Cache.empty)
    .get(context, () => Cache.from(collectRootNodes(context, options)))
    .get(node)
    .getOr(node);
}

export namespace getRootNode {
  export interface Options {
    readonly composed?: boolean;
    readonly flattened?: boolean;
  }
}

function collectRootNodes(
  root: Node,
  options: getRootNode.Options
): Iterable<[Node, Node]> {
  return traverseNode(
    root,
    root,
    {
      *enter(node) {
        yield [node, root];

        if (options.composed !== true && options.flattened !== true) {
          const shadowRoot = isElement(node) ? node.shadowRoot : null;

          // If a shadow root is encountered and we're looking for neither a
          // composed nor flattened root, recurse into the shadow root and
          // mark it as the root of itself and all its descendants.
          if (shadowRoot !== null && shadowRoot !== undefined) {
            yield* collectRootNodes(shadowRoot, options);
          }
        }

        const contentDocument = isElement(node) ? node.contentDocument : null;

        if (contentDocument !== null && contentDocument !== undefined) {
          yield* collectRootNodes(contentDocument, options);
        }
      }
    },
    { ...options, nested: false }
  );
}
