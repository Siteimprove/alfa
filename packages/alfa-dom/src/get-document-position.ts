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

const documentPositions = Cache.empty<Mode, Cache<Node, Cache<Node, number>>>(
  Cache.Type.Strong
);

/**
 * Given a node and a context, get the document position of the node within the
 * context. If the node does not exist within the given context then `null` is
 * returned.
 */
export function getDocumentPosition(
  node: Node,
  context: Node,
  options: getDocumentPosition.Options = {}
): Option<number> {
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

  return documentPositions
    .get(mode, Cache.empty)
    .get(context, () => {
      let position = 0;

      return Cache.from<Node, number>(
        traverseNode(
          context,
          context,
          {
            *enter(node) {
              yield [node, position++];
            }
          },
          options
        )
      );
    })
    .get(node);
}

export namespace getDocumentPosition {
  export interface Options {
    readonly composed?: boolean;
    readonly flattened?: boolean;
    readonly nested?: boolean;
  }
}
