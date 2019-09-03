import { Predicate } from "@siteimprove/alfa-util";
import { isElement } from "./guards";
import { matches } from "./matches";
import { traverseNode } from "./traverse-node";
import { Element, Node } from "./types";

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
  options?: querySelector.Options
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
  options?: querySelector.Options
): T | null;

export function querySelector<T extends Node>(
  scope: Node,
  context: Node,
  query: string | Predicate<Node, T>,
  options: querySelector.Options = {}
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
      enter(node, parentNode, { exit }) {
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

export namespace querySelector {
  export type Options = traverseNode.Options;
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
  options?: querySelectorAll.Options
): Iterable<Element>;

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
  options?: querySelectorAll.Options
): Iterable<T>;

export function querySelectorAll<T extends Node>(
  scope: Node,
  context: Node,
  query: string | Predicate<Node, T>,
  options: querySelectorAll.Options = {}
): Iterable<T> {
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

export namespace querySelectorAll {
  export type Options = traverseNode.Options;
}
