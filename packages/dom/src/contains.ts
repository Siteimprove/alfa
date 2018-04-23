import { Node, Element } from "./types";
import { Predicate } from "./collect";
import { isElement } from "./guards";
import { matches } from "./matches";
import { find } from "./find";

export function contains<T extends Node>(
  node: Node,
  context: Node,
  query: Predicate<Node, T> | T | string
): boolean {
  let predicate: Predicate<Node, T>;

  if (typeof query === "string") {
    predicate = node => isElement(node) && matches(node, context, query);
  } else if (typeof query === "object") {
    predicate = node => node === query;
  } else {
    predicate = query;
  }

  return find(node, context, predicate) !== null;
}
