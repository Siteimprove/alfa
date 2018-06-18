import { Predicate } from "@siteimprove/alfa-util";
import { Node } from "./types";
import { querySelector } from "./query-selector";
import { getClosest } from "./get-closest";

/**
 * Given a node and a context, check if the node contains another node that
 * matches the given query. One node is said to contain another node if the
 * other node is an inclusive descendant of the first.
 *
 * @see https://www.w3.org/TR/dom/#dom-node-contains
 * @see https://www.w3.org/TR/dom/#concept-tree-inclusive-descendant
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
  options: Readonly<{ composed?: boolean }> = {}
): boolean {
  if (typeof query === "object") {
    return getClosest(query, context, node => node === scope) !== null;
  }

  if (typeof query === "string") {
    return querySelector(scope, context, query, options) !== null;
  }

  return querySelector(scope, context, query, options) !== null;
}
