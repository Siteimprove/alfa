import { Node } from "./types";
import { isText } from "./guards";
import { traverse } from "./traverse";

export function getText(node: Node): string {
  let text = "";

  traverse(node, node => {
    if (isText(node)) {
      text += node.data;
    }
  });

  return text;
}
