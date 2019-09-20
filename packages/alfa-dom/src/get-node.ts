import { Cache } from "@siteimprove/alfa-util";
import { traverseNode } from "./traverse-node";
import { Node } from "./types";

// prettier-ignore
enum Mode {
  Normal    = 0b01_0,
  Composed  = 0b10_0,
  Flattened = 0b11_0,
  Nested    = 0b00_1
}

const nodes = Cache.of<Mode, Cache<Node, Cache<number, Node>>>({ weak: false });

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
    .get(mode, Cache.of)
    .get(context, () => {
      const nodes = Cache.of<number, Node>({ weak: false });

      let position = 0;

      traverseNode(
        context,
        context,
        {
          enter(node) {
            nodes.set(position++, node);
          }
        },
        options
      );

      return nodes;
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
