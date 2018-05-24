import { Predicate } from "@siteimprove/alfa-util";
import { Node, Element } from "./types";
import { isElement } from "./guards";
import { matches } from "./matches";
import { traverseNode } from "./traverse-node";

export type FindOptions = Readonly<{ composed?: boolean }>;

export function find(
  scope: Node,
  context: Node,
  query: string,
  options?: FindOptions
): Element | null;

export function find<T extends Node>(
  scope: Node,
  context: Node,
  query: Predicate<Node, T>,
  options?: FindOptions
): T | null;

export function find<T extends Node>(
  scope: Node,
  context: Node,
  query: Predicate<Node, T> | string,
  options: FindOptions = {}
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
      enter(node) {
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

export function findAll(
  scope: Node,
  context: Node,
  query: string,
  options?: FindOptions
): Array<Element>;

export function findAll<T extends Node>(
  scope: Node,
  context: Node,
  query: Predicate<Node, T>,
  options?: FindOptions
): Array<T>;

export function findAll<T extends Node>(
  scope: Node,
  context: Node,
  query: Predicate<Node, T> | string,
  options: FindOptions = {}
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
