import { isText } from "./guards";
import { traverseNode } from "./traverse-node";
import { Node } from "./types";

/**
 * Given a node, check if the node or its descendants contain non-empty text.
 *
 * @example
 * const div = <div>Hello <span>world</span></div>;
 * hasText(div);
 * // => true
 */
export function hasTextContent(
  node: Node,
  context: Node,
  options: hasTextContent.Options = {}
): boolean {
  const [hasTextContent = false] = traverseNode(
    node,
    context,
    {
      *enter(node, parentNode) {
        if (isText(node) && node.data.trim() !== "") {
          yield true;
        }
      }
    },
    { ...options, nested: false }
  );

  return hasTextContent;
}

export namespace hasTextContent {
  export interface Options {
    readonly composed?: boolean;
    readonly flattened?: boolean;
  }
}
