import { Node, Element } from "./types";
import { Predicate } from "./collect";
import { isElement } from "./guards";
import { matches } from "./matches";
import { traverse, TraverseOptions } from "./traverse";

export type FindOptions = TraverseOptions;

export function find(
  node: Node,
  context: Node,
  query: string,
  options?: FindOptions
): Element | null;

export function find<T extends Node>(
  node: Node,
  context: Node,
  query: Predicate<Node, T>,
  options?: FindOptions
): T | null;

export function find<T extends Node>(
  node: Node,
  context: Node,
  query: Predicate<Node, T> | string,
  options: FindOptions = {}
): T | null {
  let predicate: Predicate<Node, T>;

  if (typeof query === "string") {
    predicate = node => isElement(node) && matches(node, context, query);
  } else {
    predicate = query;
  }

  let found: T | null = null;

  traverse(
    node,
    node => {
      if (found !== null) {
        return false;
      }

      if (predicate(node)) {
        found = node;
      }
    },
    options
  );

  return found;
}

export function findAll(
  node: Node,
  context: Node,
  query: string,
  options?: FindOptions
): Array<Element>;

export function findAll<T extends Node>(
  node: Node,
  context: Node,
  query: Predicate<Node, T>,
  options?: FindOptions
): Array<T>;

export function findAll<T extends Node>(
  node: Node,
  context: Node,
  query: Predicate<Node, T> | string,
  options: FindOptions = {}
): Array<T> {
  let predicate: Predicate<Node, T>;

  if (typeof query === "string") {
    predicate = node => isElement(node) && matches(node, context, query);
  } else {
    predicate = query;
  }

  const found: Array<T> = [];

  traverse(
    node,
    node => {
      if (predicate(node)) {
        found.push(node);
      }
    },
    options
  );

  return found;
}
