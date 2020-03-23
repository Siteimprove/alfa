import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasNamespace(
  predicate: Predicate<Namespace> = () => true
): Predicate<Element> {
  return (element) => element.namespace.some(predicate);
}
