import { Node } from "./types";
import { isText } from "./guards";
import { traverseNode } from "./traverse-node";

/**
 * Given a node, get the text content of all descendants of the node.
 *
 * @see https://www.w3.org/TR/dom/#dom-node-textcontent
 *
 * @example
 * const div = <div>Hello <span>world</span></div>;
 * getTextContent(div);
 * // => "Hello world"
 */
export function getTextContent(node: Node): string {
  let text = "";

  traverseNode(node, {
    enter(node, parent) {
      if (isText(node)) {
        text += node.data;
      }
    }
  });

  return text;
}
