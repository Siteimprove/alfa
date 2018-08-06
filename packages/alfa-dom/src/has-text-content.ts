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
  options: Readonly<{ composed?: boolean; flattened?: boolean }> = {}
): boolean {
  let text = false;

  traverseNode(
    node,
    {
      enter(node, parent) {
        if (isText(node) && node.data.trim() !== "") {
          text = true;
          return false;
        }
      }
    },
    options
  );

  return text;
}
