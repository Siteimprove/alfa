import { Predicate } from "@siteimprove/alfa-util";
import { getClosest } from "./get-closest";
import { querySelector } from "./query-selector";
import { Node } from "./types";

/**
 * Given a node and a context, check if the node contains another node that
 * matches the given selector, predicate, or node. One node is said to contain
 * another node if the other node is an inclusive descendant of the first.
 *
 * @see https://dom.spec.whatwg.org/#dom-node-contains
 * @see https://dom.spec.whatwg.org/#concept-tree-inclusive-descendant
 *
 * @example
 * const div = <div><span /></div>;
 * contains(div, <section>{div}</section>, "span");
 * // => true
 *
 * @example
 * const span = <span />;
 * const div = <div>{span}</div>;
 * contains(div, <section>{div}</section>, span);
 * // => true
 */
export function contains<T extends Node>(
  scope: Node,
  context: Node,
  query: string | Predicate<Node, T> | T,
  options: contains.Options = {}
): boolean {
  if (typeof query === "object") {
    return getClosest(query, context, node => node === scope, options) !== null;
  }

  let match: Node | null;

  if (typeof query === "string") {
    match = querySelector(scope, context, query, { ...options, nested: false });
  } else {
    match = querySelector(scope, context, query, { ...options, nested: false });
  }

  return match !== null;
}

export namespace contains {
  export interface Options {
    readonly composed?: boolean;
    readonly flattened?: boolean;
  }
}
