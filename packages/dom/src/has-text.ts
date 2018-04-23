import { Node } from "./types";
import { isText } from "./guards";
import { traverse } from "./traverse";

/**
 * Given a node, check if the node or its descendants contain non-empty text.
 *
 * @example
 * const div = <div>Hello <span>world</span></div>;
 * hasText(div);
 * // => true
 */
export function hasText(node: Node): boolean {
  let text = false;

  traverse(node, node => {
    if (isText(node) && node.data.trim() !== "") {
      text = true;
      return false;
    }
  });

  return text;
}
