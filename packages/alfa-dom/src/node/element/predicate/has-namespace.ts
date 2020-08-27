import { Predicate } from "@siteimprove/alfa-predicate";

import { Element } from "../../element";
import { Namespace } from "../../../namespace";
import { Mapper } from "@siteimprove/alfa-mapper";

const { equals } = Predicate;

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

interface Has<T, K> {
  (predicate: Predicate<K>): Predicate<T>;
  (value: K, ...rest: Array<K>): Predicate<T>;
}

function has<T, K>(selector: Mapper<T, K>): Has<T, K> {
  return (predicateOrKey: Predicate<K> | K, ...keys: Array<K>) => {
    let predicate: Predicate<K>;

    if (typeof predicateOrKey === "function") {
      predicate = predicateOrKey as Predicate<K>;
    } else {
      predicate = equals(predicateOrKey, ...keys);
    }

    return (value: T) => predicate(selector(value));
  };
}
