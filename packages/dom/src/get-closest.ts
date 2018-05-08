import { Predicate } from "@alfa/util";
import { Node, Element } from "./types";
import { isElement } from "./guards";
import { matches } from "./matches";
import { getParentNode } from "./get-parent-node";

/**
 * Given a node and a context, get the closest parent (or the node itself) that
 * matches the given selector.
 *
 * @see https://dom.spec.whatwg.org/#dom-element-closest
 *
 * @example
 * const span = <span />;
 * getClosests(
 *   span,
 *   <div class="foo"><div class="bar">{span}</div></div>,
 *   ".foo"
 * );
 * // => <div class="foo">...</div>
 */
export function getClosest(
  node: Node,
  context: Node,
  query: string
): Element | null;

/**
 * Given a node and a context, get the closest parent (or the node itself) that
 * matches the given predicate.
 *
 * @see https://dom.spec.whatwg.org/#dom-element-closest
 *
 * @example
 * const span = <span />;
 * getClosests(
 *   span,
 *   <div class="foo"><div class="bar">{span}</div></div>,
 *   node => isElement(node) && getTag(node) === "div"
 * );
 * // => <div class="bar">...</div>
 */
export function getClosest<T extends Node>(
  node: Node,
  context: Node,
  query: Predicate<Node, T>
): T | null;

export function getClosest<T extends Node>(
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

  for (
    let next: Node | null = node;
    next;
    next = getParentNode(next, context)
  ) {
    if (predicate(next)) {
      return next;
    }
  }

  return null;
}
