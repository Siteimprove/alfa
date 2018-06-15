import { Predicate } from "@siteimprove/alfa-util";
import { Node, Element } from "./types";
import { isElement } from "./guards";
import { matches } from "./matches";
import { traverseNode } from "./traverse-node";

export type QuerySelectorOptions = Readonly<{ composed?: boolean }>;

/**
 * @see https://www.w3.org/TR/dom/#dom-parentnode-queryselector
 */
export function querySelector(
  scope: Node,
  context: Node,
  query: string,
  options?: QuerySelectorOptions
): Element;

/**
 * @see https://www.w3.org/TR/dom/#dom-parentnode-queryselector
 */
export function querySelector<T extends Node>(
  scope: Node,
  context: Node,
  query: Predicate<Node, T>,
  options?: QuerySelectorOptions
): T;

export function querySelector<T extends Node>(
  scope: Node,
  context: Node,
  query: string | Predicate<Node, T>,
  options?: QuerySelectorOptions
): T | null {
  let predicate: Predicate<Node, T>;

  if (typeof query === "string") {
    const options = { scope: isElement(scope) ? scope : undefined };
    predicate = node =>
      isElement(node) && matches(node, context, query, options);
  } else {
    predicate = query;
  }

  let found: T | null = null;

  traverseNode(
    scope,
    {
      enter(node, parent) {
        if (predicate(node)) {
          found = node;
          return false;
        }
      }
    },
    options
  );

  return found;
}

/**
 * @see https://www.w3.org/TR/dom/#dom-parentnode-queryselectorall
 */
export function querySelectorAll(
  scope: Node,
  context: Node,
  query: string,
  options?: QuerySelectorOptions
): Array<Element>;

/**
 * @see https://www.w3.org/TR/dom/#dom-parentnode-queryselectorall
 */
export function querySelectorAll<T extends Node>(
  scope: Node,
  context: Node,
  query: Predicate<Node, T>,
  options?: QuerySelectorOptions
): Array<T>;

export function querySelectorAll<T extends Node>(
  scope: Node,
  context: Node,
  query: string | Predicate<Node, T>,
  options: QuerySelectorOptions = {}
): Array<T> {
  let predicate: Predicate<Node, T>;

  if (typeof query === "string") {
    const options = { scope: isElement(scope) ? scope : undefined };
    predicate = node =>
      isElement(node) && matches(node, context, query, options);
  } else {
    predicate = query;
  }

  const found: Array<T> = [];

  traverseNode(
    scope,
    {
      enter(node, parent) {
        if (predicate(node)) {
          found.push(node);
        }
      }
    },
    options
  );

  return found;
}
