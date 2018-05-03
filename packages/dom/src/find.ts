import { Predicate } from "@alfa/util";
import { Node, Element } from "./types";
import { isElement } from "./guards";
import { matches } from "./matches";
import { traverseNode } from "./traverse-node";

export type FindOptions = Readonly<{ composed?: boolean }>;

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

  traverseNode(
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

  traverseNode(
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
