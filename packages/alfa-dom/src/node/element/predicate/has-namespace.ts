import { Predicate } from "@siteimprove/alfa-predicate";

import { Namespace } from "../../../namespace";
import { Element } from "../../element";

const { equals } = Predicate;

/**
 * @public
 */
export function hasNamespace(
  predicate: Predicate<Namespace>,
): Predicate<Element>;

/**
 * @public
 */
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
