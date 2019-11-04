import { Cache } from "@siteimprove/alfa-cache";
import { Option } from "@siteimprove/alfa-option";

import { traverseNode } from "./traverse-node";
import { Node } from "./types";

// prettier-ignore
enum Mode {
  Normal    = 0b01_0,
  Composed  = 0b10_0,
  Flattened = 0b11_0,
  Nested    = 0b00_1
}

const nodes = Cache.empty<Mode, Cache<Node, Cache<number, Node>>>(
  Cache.Type.Strong
);

/**
 * Given a context and a document position, get the node at the given document
 * position within the context. If no node exists within the context at the
 * given document position then `null` is returned.
 */
export function getNode(
  context: Node,
  documentPosition: number,
  options: getNode.Options = {}
): Option<Node> {
  let mode = Mode.Normal;

  if (options.composed === true) {
    mode = Mode.Composed;
  }

  if (options.flattened === true) {
    mode = Mode.Flattened;
  }

  if (options.nested === true) {
    mode |= Mode.Nested;
  }

  return nodes
    .get(mode, Cache.empty)
    .get(context, () => {
      let position = 0;

      return Cache.from<number, Node>(
        traverseNode(
          context,
          context,
          {
            *enter(node) {
              yield [position++, node];
            }
          },
          options
        ),
        Cache.Type.Strong
      );
    })
    .get(documentPosition);
}

export namespace getNode {
  export interface Options {
    readonly composed?: boolean;
    readonly flattened?: boolean;
    readonly nested?: boolean;
  }
}
