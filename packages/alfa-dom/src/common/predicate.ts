import { Predicate } from "@siteimprove/alfa-predicate";
import {Element, Namespace, Node} from "..";

const { and, equals, property } = Predicate;

// Bad copy from rule helpers. Move to DOM helpers?
function hasNamespace(
  predicate: Predicate<Namespace> = () => true
): Predicate<Element> {
  return (element) => element.namespace.some(predicate);
}

export function hasName<T extends { readonly name: string }>(
  predicate: Predicate<string> = () => true
): Predicate<T> {
  return property("name", predicate);
}
// end copied from rule

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
