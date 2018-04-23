import { Node, Element } from "./types";
import { Predicate } from "./collect";
import { isElement } from "./guards";
import { matches } from "./matches";
import { getParent } from "./get-parent";

/**
 * Given a node and a context, get the closest parent (or the node itself) that
 * matches the given selector.
 *
 * @example
 * const span = <span />;
 * closests(
 *   span,
 *   <div class="foo"><div class="bar">{span}</div></div>,
 *   ".foo"
 * );
 * // => <div class="foo">...</div>
 */
export function closest(
  node: Node,
  context: Node,
  query: string
): Element | null;

/**
 * Given a node and a context, get the closest parent (or the node itself) that
 * matches the given predicate.
 *
 * @example
 * const span = <span />;
 * closests(
 *   span,
 *   <div class="foo"><div class="bar">{span}</div></div>,
 *   node => isElement(node) && getTag(node) === "div"
 * );
 * // => <div class="bar">...</div>
 */
export function closest<T extends Node>(
  node: Node,
  context: Node,
  query: Predicate<Node, T>
): T | null;

export function closest<T extends Node>(
  node: Node,
  context: Node,
  query: Predicate<Node, T> | string
): T | null {
  let predicate: Predicate<Node, T>;

  if (typeof query === "string") {
    predicate = node => isElement(node) && matches(node, context, query);
  } else {
    predicate = query;
  }

  for (let next: Node | null = node; next; next = getParent(next, context)) {
    if (predicate(next)) {
      return next;
    }
  }

  return null;
}
