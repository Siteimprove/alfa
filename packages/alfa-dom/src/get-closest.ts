import { Predicate } from "@siteimprove/alfa-util";
import { getParentNode } from "./get-parent-node";
import { isElement } from "./guards";
import { matches } from "./matches";
import { Element, Node } from "./types";

export type GetClosestResult<T extends Node, Q> = Q extends string
  ? Element
  : T;

/**
 * Given a node and a context, get the closest parent (or the node itself) that
 * matches the given selector or predicate.
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
export function getClosest<
  T extends Node,
  Q extends string | Predicate<Node, T>
>(
  scope: Node,
  context: Node,
  query: Q,
  options: Readonly<{ composed?: boolean; flattened?: boolean }> = {}
): GetClosestResult<T, Q> | null {
  let predicate: Predicate<Node, T>;

  if (typeof query === "string") {
    const matchesOptions = {
      ...options,
      scope: isElement(scope) ? scope : undefined
    };
    predicate = node =>
      isElement(node) && matches(node, context, query, matchesOptions);
  } else {
    predicate = query as Predicate<Node, T>;
  }

  for (
    let next: Node | null = scope;
    next !== null;
    next = getParentNode(next, context, options)
  ) {
    if (predicate(next)) {
      return next as GetClosestResult<T, Q>;
    }
  }

  return null;
}
