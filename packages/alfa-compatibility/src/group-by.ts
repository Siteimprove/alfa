import { List, Map } from "@siteimprove/alfa-collection";
import { BrowserSpecific } from "./browser-specific";
import { map } from "./map";
import { reduce } from "./reduce";

export function groupBy<T, K>(
  values: ArrayLike<BrowserSpecific<T>>,
  iteratee: (value: T) => K | BrowserSpecific<K>
): BrowserSpecific<Map<K, List<T>>>;

export function groupBy<T, K>(
  values: ArrayLike<T | BrowserSpecific<T>>,
  iteratee: (value: T) => K | BrowserSpecific<K>
): Map<K, List<T>> | BrowserSpecific<Map<K, List<T>>>;

export function groupBy<T, K>(
  values: ArrayLike<T>,
  iteratee: (value: T) => K
): Map<K, List<T>>;

export function groupBy<T, K>(
  values: ArrayLike<T | BrowserSpecific<T>>,
  iteratee: (value: T) => K | BrowserSpecific<K>
): Map<K, List<T>> | BrowserSpecific<Map<K, List<T>>> {
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
