import { Node } from "./types";
import { Predicate } from "./collect";
import { isElement, isChild } from "./guards";
import { matches } from "./matches";

export function closest<T extends Node>(
  context: Node,
  predicate: Predicate<Node, T> | string
): T | null {
  if (typeof predicate === "string") {
    const selector = predicate;
    predicate = node => isElement(node) && matches(node, selector);
  }

  for (
    let next: Node | null = context;
    next;
    next = isChild(next) ? next.parentNode || null : null
  ) {
    if (predicate(next)) {
      return next as T;
    }
  }

  return null;
}
