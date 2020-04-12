import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import equals = Predicate.equals;

export function hasNamespace(
  predicate: Predicate<Namespace>
): Predicate<Element>;
export function hasNamespace(
  ...namespaces: Array<Namespace>
): Predicate<Element>;
export function hasNamespace(): Predicate<Element> {
  let predicate: Predicate<Namespace>;

  if (arguments.length === 0) {
    predicate = () => true;
  }
  if (arguments.length === 1 && typeof arguments[0] === "function") {
    predicate = arguments[0];
  }
  if (arguments.length !== 0 && typeof arguments[0] !== "function") {
    predicate = equals(...arguments);
  }

  return (element) => element.namespace.some(predicate);
}
