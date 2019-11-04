import { Cache } from "@siteimprove/alfa-cache";
import { None, Option, Some } from "@siteimprove/alfa-option";

import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";
import { Node } from "./types";

enum Mode {
  Composed,
  Flattened
}

const parentNodes = Cache.empty<Mode, Cache<Node, Cache<Node, Node>>>(
  Cache.Type.Strong
);

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

  return parentNodes
    .get(mode, Cache.empty)
    .get(context, () =>
      Cache.from<Node, Node>(
        traverseNode(
          context,
          context,
          {
            *enter(node, parentNode) {
              if (parentNode !== null) {
                yield [node, parentNode];
              }
            }
          },
          {
            composed: options.flattened !== true,
            flattened: options.flattened,
            nested: true
          }
        )
      )
    )
    .get(node)
    .flatMap(parentNode => {
      if (
        options.composed !== true &&
        isElement(parentNode) &&
        parentNode.shadowRoot === node
      ) {
        return None;
      }

      return Some.of(parentNode);
    });
}

export namespace getParentNode {
  export interface Options {
    readonly composed?: boolean;
    readonly flattened?: boolean;
  }
}
