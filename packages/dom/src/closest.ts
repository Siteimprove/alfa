import { Node, Element } from "./types";
import { Predicate } from "./collect";
import { isElement } from "./guards";
import { matches } from "./matches";

export function closest(context: Node, query: string): Element | null;

export function closest<T extends Node>(
  context: Node,
  query: Predicate<Node, T>
): T | null;

export function closest<T extends Node>(
  context: Node,
  query: Predicate<Node, T> | string
): T | null {
  let predicate: Predicate<Node, T>;

  if (typeof query === "string") {
    predicate = node => isElement(node) && matches(node, query);
  } else {
    predicate = query;
  }

  for (let next: Node | null = context; next; next = next.parentNode) {
    if (predicate(next)) {
      return next;
    }
  }

  return null;
}
