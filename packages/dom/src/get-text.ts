import { Node } from "./types";
import { isText } from "./guards";
import { traverse } from "./traverse";

/**
 * Given a node, get the text content of all descendants of the node.
 *
 * @example
 * const div = <div>Hello <span>world</span></div>;
 * getText(div);
 * // => "Hello world"
 */
export function getText(node: Node): string {
  let text = "";

  traverse(node, node => {
    if (isText(node)) {
      text += node.data;
    }
  });

  return text;
}
