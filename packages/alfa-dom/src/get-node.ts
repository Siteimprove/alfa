import { Cache } from "@siteimprove/alfa-util";
import { traverseNode } from "./traverse-node";
import { Node } from "./types";

enum Mode {
  Normal,
  Composed,
  Flattened
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
        { ...options, nested: false }
      );

      return nodes;
    })
    .get(documentPosition);
}

export namespace getNode {
  export interface Options {
    readonly composed?: boolean;
    readonly flattened?: boolean;
  }
}
