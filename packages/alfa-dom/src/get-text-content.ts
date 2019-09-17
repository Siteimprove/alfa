import { isText } from "./guards";
import { traverseNode } from "./traverse-node";
import { Node } from "./types";

/**
 * Given a node, get the text content of all descendants of the node.
 *
 * @see https://dom.spec.whatwg.org/#dom-node-textcontent
 *
 * @example
 * const div = <div>Hello <span>world</span></div>;
 * getTextContent(div);
 * // => "Hello world"
 */
export function getTextContent(
  node: Node,
  context: Node,
  options: getTextContent.Options = {}
): string {
  let text = "";

  traverseNode(
    node,
    context,
    {
      enter(node) {
        if (isText(node)) {
          text += node.data;
        }
      }
    },
    { ...options, nested: false }
  );

  return text;
}

export namespace getTextContent {
  export interface Options {
    readonly composed?: boolean;
    readonly flattened?: boolean;
  }
}
