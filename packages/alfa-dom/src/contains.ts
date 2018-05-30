import { Predicate } from "@siteimprove/alfa-util";
import { Node } from "./types";
import { find } from "./find";
import { getClosest } from "./get-closest";

export type ContainsOptions = Readonly<{ composed?: boolean }>;

/**
 * Given a node and a context, check if the node contains another node that
 * matches the given query. One node is said to contain another node if the
 * other node is a descendant of the first.
 *
 * @see https://dom.spec.whatwg.org/#dom-node-contains
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
  query: Predicate<Node, T> | T | string,
  options: ContainsOptions = {}
): boolean {
  if (typeof query === "object") {
    return getClosest(query, context, node => node === scope) !== null;
  }

  return find(scope, context, query, options) !== null;
}
