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

const documentPositions = Cache.of<Mode, Cache<Node, Cache<Node, number>>>({
  weak: false
});

/**
 * Given a node and a context, get the document position of the node within the
 * context. If the node does not exist within the given context then `null` is
 * returned.
 */
export function getDocumentPosition(
  node: Node,
  context: Node,
  options: getDocumentPosition.Options = {}
): number | null {
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
    .get(mode, Cache.of)
    .get(context, () => {
      const documentPositions = Cache.of<Node, number>();

      let position = 0;

      traverseNode(
        context,
        context,
        {
          enter(node) {
            documentPositions.set(node, position++);
          }
        },
        options
      );

      return documentPositions;
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
