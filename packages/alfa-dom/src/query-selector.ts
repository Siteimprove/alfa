import { Predicate } from "@siteimprove/alfa-util";
import { isElement } from "./guards";
import { matches } from "./matches";
import { traverseNode } from "./traverse-node";
import { Element, Node } from "./types";

export type QuerySelectorOptions = Readonly<{
  composed?: boolean;
  flattened?: boolean;
}>;

/**
 * Given a scope and a context, get the first node within the scope that matches
 * the given selector within the context. If no node is found that matches the
 * selector, `null` is returned.
 *
 * @see https://www.w3.org/TR/dom/#dom-parentnode-queryselector
 */
export function querySelector(
  scope: Node,
  context: Node,
  selector: string,
  options?: QuerySelectorOptions
): Element | null;

/**
 * Given a scope and a context, get the first node within the scope that matches
 * the given predicate within the context. If no node is found that matches the
 * predicate, `null` is returned.
 *
 * @see https://www.w3.org/TR/dom/#dom-parentnode-queryselector
 */
export function querySelector<T extends Node>(
  scope: Node,
  context: Node,
  predicate: Predicate<Node, T>,
  options?: QuerySelectorOptions
): T | null;

export function querySelector<T extends Node>(
  scope: Node,
  context: Node,
  query: string | Predicate<Node, T>,
  options: QuerySelectorOptions = {}
): T | null {
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

  let found: T | null = null;

  traverseNode(
    scope,
    context,
    {
      enter(node, parentNode, skip, exit) {
        if (predicate(node)) {
          found = node;
          return exit;
        }
      }
    },
    options
  );

  return found;
}

/**
 * Given a scope and a context, get all nodes within the scope that match the
 * given selector within the context. If no nodes are found that match the
 * selector, an empty array is returned.
 *
 * @see https://www.w3.org/TR/dom/#dom-parentnode-queryselectorall
 */
export function querySelectorAll(
  scope: Node,
  context: Node,
  selector: string,
  options?: QuerySelectorOptions
): ReadonlyArray<Element>;

/**
 * Given a scope and a context, get all nodes within the scope that match the
 * given predicate within the context. If no nodes are found that match the
 * predicate, an empty array is returned.
 *
 * @see https://www.w3.org/TR/dom/#dom-parentnode-queryselectorall
 */
export function querySelectorAll<T extends Node>(
  scope: Node,
  context: Node,
  predicate: Predicate<Node, T>,
  options?: QuerySelectorOptions
): ReadonlyArray<T>;

export function querySelectorAll<T extends Node>(
  scope: Node,
  context: Node,
  query: string | Predicate<Node, T>,
  options: QuerySelectorOptions = {}
): ReadonlyArray<T> {
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

  const found: Array<T> = [];

  traverseNode(
    scope,
    context,
    {
      enter(node) {
        if (predicate(node)) {
          found.push(node);
        }
      }
    },
    options
  );

  return found;
}
