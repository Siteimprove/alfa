import { Predicate } from "@siteimprove/alfa-predicate";
import {Element, Namespace, Node} from "..";

const { and, equals, property } = Predicate;

export function hasNamespace(
  predicate: Predicate<Namespace>
): Predicate<Element>;

export function hasNamespace(
  namespace: Namespace,
  ...rest: Array<Namespace>
): Predicate<Element>;

export function hasNamespace(
  namespaceOrPredicate: Namespace | Predicate<Namespace>,
  ...namespaces: Array<Namespace>
): Predicate<Element> {
  let predicate: Predicate<Namespace>;

  if (typeof namespaceOrPredicate === "function") {
    predicate = namespaceOrPredicate;
  } else {
    predicate = equals(namespaceOrPredicate, ...namespaces);
  }

  return (element) => element.namespace.some(predicate);
}

export function hasName<T extends { readonly name: string }>(
  predicate: Predicate<string>
): Predicate<T>;

export function hasName<T extends { readonly name: string }>(
  name: string,
  ...rest: Array<string>
): Predicate<T>;

export function hasName<T extends { readonly name: string }>(
  nameOrPredicate: string | Predicate<string>,
  ...names: Array<string>
): Predicate<T> {
  let predicate: Predicate<string>;

  if (typeof nameOrPredicate === "function") {
    predicate = nameOrPredicate;
  } else {
    predicate = equals(nameOrPredicate, ...names);
  }

  return property("name", predicate);
}
export function isElementByName(
  ...names: Array<string>
): Predicate<Node, Element> {
  return and(
    Element.isElement,
    and(hasNamespace(equals(Namespace.HTML)), hasName(equals(...names)))
  );
}

export function isDescendantOf(
  node: Node,
  options?: Node.Traversal
): Predicate<Node> {
  return (desc) => node.descendants(options).find(equals(desc)).isSome();
}
