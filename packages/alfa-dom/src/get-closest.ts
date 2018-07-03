import { Predicate } from "@siteimprove/alfa-util";
import { getParentNode } from "./get-parent-node";
import { isElement } from "./guards";
import { matches } from "./matches";
import { Element, Node } from "./types";

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
  scope: Node,
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
  scope: Node,
  context: Node,
  query: Predicate<Node, T>
): T | null;

export function getClosest<T extends Node>(
  scope: Node,
  context: Node,
  query: Predicate<Node, T> | string
): T | null {
  let predicate: Predicate<Node, T>;

  if (typeof query === "string") {
    const options = { scope: isElement(scope) ? scope : undefined };
    predicate = node =>
      isElement(node) && matches(node, context, query, options);
  } else {
    predicate = query;
  }

  for (
    let next: Node | null = scope;
    next !== null;
    next = getParentNode(next, context)
  ) {
    if (predicate(next)) {
      return next;
    }
  }

  return null;
}
