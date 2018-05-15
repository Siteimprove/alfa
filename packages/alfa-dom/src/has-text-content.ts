import { Node } from "./types";
import { isText } from "./guards";
import { traverseNode } from "./traverse-node";

/**
 * Given a node, check if the node or its descendants contain non-empty text.
 *
 * @example
 * const div = <div>Hello <span>world</span></div>;
 * hasText(div);
 * // => true
 */
export function hasTextContent(node: Node): boolean {
  let text = false;

  traverseNode(node, {
    enter(node) {
      if (isText(node) && node.data.trim() !== "") {
        text = true;
        return false;
      }
    }
  });

  return text;
}
