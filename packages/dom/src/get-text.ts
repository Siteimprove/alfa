import { Node } from "./types";
import { isText } from "./guards";
import { findAll } from "./find";

export function getText(node: Node): string {
  return findAll(node, isText)
    .map(text => text.data)
    .join("");
}
