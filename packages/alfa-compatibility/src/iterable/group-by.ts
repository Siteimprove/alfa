import { List, Map } from "@siteimprove/alfa-collection";
import { BrowserSpecific } from "../browser-specific";
import { reduce } from "./reduce";

const { map } = BrowserSpecific;

export function groupBy<T, K>(
  values: BrowserSpecific<Iterable<T>>,
  iteratee: (value: T) => K | BrowserSpecific<K>
): BrowserSpecific<Iterable<[K, Iterable<T>]>>;

export function groupBy<T, K>(
  values: Iterable<T> | BrowserSpecific<Iterable<T>>,
  iteratee: (value: T) => K | BrowserSpecific<K>
): Iterable<[K, Iterable<T>]> | BrowserSpecific<Iterable<[K, Iterable<T>]>>;

export function groupBy<T, K>(
  values: Iterable<T>,
  iteratee: (value: T) => K
): Iterable<[K, Iterable<T>]>;

export function groupBy<T, K>(
  values: Iterable<T> | BrowserSpecific<Iterable<T>>,
  iteratee: (value: T) => K | BrowserSpecific<K>
): Iterable<[K, Iterable<T>]> | BrowserSpecific<Iterable<[K, Iterable<T>]>> {
  return reduce<T, Map<K, List<T>>>(
    values,
    (groups, value) => {
      return map(iteratee(value), key => {
        return groups.set(key, groups.get(key, List()).push(value));
      });
    },
    Map()
  );
}
