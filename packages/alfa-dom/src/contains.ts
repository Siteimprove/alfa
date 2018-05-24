import { Predicate } from "@siteimprove/alfa-util";
import { Node, Element } from "./types";
import { isElement } from "./guards";
import { matches } from "./matches";
import { find } from "./find";

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
  let predicate: Predicate<Node, T>;

  if (typeof query === "string") {
    const options = { scope: isElement(scope) ? scope : undefined };
    predicate = node =>
      isElement(node) && matches(node, context, query, options);
  } else if (typeof query === "object") {
    predicate = node => node === query;
  } else {
    predicate = query;
  }

  return find(scope, context, predicate, options) !== null;
}
