import {
  Element,
  getElementNamespace,
  Namespace,
  Node
} from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasNamespace(
  context: Node,
  predicate: Predicate<Namespace> = () => true
): Predicate<Element> {
  return element =>
    getElementNamespace(element, context)
      .filter(predicate)
      .isSome();
}
