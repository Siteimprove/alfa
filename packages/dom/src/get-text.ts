import { Node } from "./types";
import { isText } from "./guards";
import { collect } from "./collect";

export function getText(node: Node): string {
  return [...collect(node).where(isText)].map(text => text.data).join("");
}
