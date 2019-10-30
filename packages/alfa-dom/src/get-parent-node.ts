import { None, Option, Some } from "@siteimprove/alfa-option";
import { Cache } from "@siteimprove/alfa-util";
import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";
import { Node } from "./types";

enum Mode {
  Composed,
  Flattened
}

const parentNodes = Cache.of<Mode, Cache<Node, Cache<Node, Node>>>({
  weak: false
});

/**
 * Given a node and a context, get the parent of the node within the context.
 * If the node has no parent, `null` is returned.
 *
 * @see https://dom.spec.whatwg.org/#dom-node-parentnode
 */
export function getParentNode(
  node: Node,
  context: Node,
  options: getParentNode.Options = {}
): Option<Node> {
  let mode = Mode.Composed;

  if (options.flattened === true) {
    mode = Mode.Flattened;
  }

  const parentNode = parentNodes
    .get(mode, Cache.of)
    .get(context, () => {
      const parentNodes = Cache.of<Node, Node>();

      [
        ...traverseNode(
          context,
          context,
          {
            *enter(node, parentNode) {
              if (parentNode !== null) {
                parentNodes.set(node, parentNode);
              }
            }
          },
          {
            composed: options.flattened !== true,
            flattened: options.flattened,
            nested: true
          }
        )
      ];

      return parentNodes;
    })
    .get(node);

  if (parentNode === null) {
    return None;
  }

  if (
    options.composed !== true &&
    isElement(parentNode) &&
    parentNode.shadowRoot === node
  ) {
    return None;
  }

  return Some.of(parentNode);
}

export namespace getParentNode {
  export interface Options {
    readonly composed?: boolean;
    readonly flattened?: boolean;
  }
}
