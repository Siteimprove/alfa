import { Predicate } from "@siteimprove/alfa-util";
import { isElement } from "./guards";
import { matches } from "./matches";
import { traverseNode } from "./traverse-node";
import { Element, Node } from "./types";

export type QuerySelectorOptions = Readonly<{
  composed?: boolean;
  flattened?: boolean;
}>;

export type QuerySelectorResult<T extends Node, Q> = Q extends string
  ? Element
  : T;

/**
 * Given a scope and a context, get the first node within the scope that matches
 * the given selector or predicate with the context. If no node is found that
 * matches the given selector or predicate, `null` is returned.
 *
 * @see https://www.w3.org/TR/dom/#dom-parentnode-queryselector
 */
export function querySelector<
  T extends Node,
  Q extends string | Predicate<Node, T>
>(
  scope: Node,
  context: Node,
  query: Q,
  options?: QuerySelectorOptions
): QuerySelectorResult<T, Q> | null {
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

  let found: QuerySelectorResult<T, Q> | null = null;

  traverseNode(
    scope,
    context,
    {
      enter(node) {
        if (predicate(node)) {
          found = node as QuerySelectorResult<T, Q>;
          return false;
        }
      }
    },
    options
  );

  return found;
}

/**
 * Given a scope and a context, get all nodes within the scope that match the
 * given selector or predicate with the context. If no nodes are found that
 * match the given selector or predicate, an empty array is returned.
 *
 * @see https://www.w3.org/TR/dom/#dom-parentnode-queryselectorall
 */
export function querySelectorAll<
  T extends Node,
  Q extends string | Predicate<Node, T>
>(
  scope: Node,
  context: Node,
  query: Q,
  options: QuerySelectorOptions = {}
): Readonly<Array<QuerySelectorResult<T, Q>>> {
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

  const found: Array<QuerySelectorResult<T, Q>> = [];

  traverseNode(
    scope,
    context,
    {
      enter(node) {
        if (predicate(node)) {
          found.push(node as QuerySelectorResult<T, Q>);
        }
      }
    },
    options
  );

  return found;
}
