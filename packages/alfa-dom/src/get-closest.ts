import { None, Option, Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { getParentNode } from "./get-parent-node";
import { isElement } from "./guards";
import { matches } from "./matches";
import { Element, Node } from "./types";

/**
 * Given a node and a context, get the closest parent (or the node itself) that
 * matches the given selector. If no match is found then `null` is returned.
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
  selector: string,
  options?: getClosest.Options
): Option<Element>;

/**
 * Given a node and a context, get the closest parent (or the node itself) that
 * matches the given predicate. If no match is found then `null` is returned.
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
  predicate: Predicate<Node, T>,
  options?: getClosest.Options
): Option<T>;

export function getClosest<T extends Node>(
  scope: Node,
  context: Node,
  query: string | Predicate<Node, T>,
  options: getClosest.Options = {}
): Option<T> {
  let predicate: Predicate<Node, T>;

  if (typeof query === "string") {
    const matchesOptions = {
      ...options,
      scope: isElement(scope) ? scope : undefined
    };
    predicate = node =>
      isElement(node) && matches(node, context, query, matchesOptions);
  } else {
    predicate = query;
  }

  for (
    let next: Node | null = scope;
    next !== null;
    next = getParentNode(next, context, options).getOr(null)
  ) {
    if (Predicate.test(predicate, next)) {
      return Some.of(next);
    }
  }

  return None;
}

export namespace getClosest {
  export interface Options {
    readonly composed?: boolean;
    readonly flattened?: boolean;
  }
}
