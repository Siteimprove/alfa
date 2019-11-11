import {
  Element,
  getElementNamespace,
  Namespace,
  Node
} from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasNamespace(
  context: Node,
  namespace: Namespace
): Predicate<Element> {
  return element =>
    getElementNamespace(element, context)
      .map(found => found === namespace)
      .getOr(false);
}
