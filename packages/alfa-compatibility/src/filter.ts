import { List } from "@siteimprove/alfa-collection";
import { BrowserSpecific } from "./browser-specific";
import { map } from "./map";
import { reduce } from "./reduce";

export function filter<T>(
  values: ArrayLike<BrowserSpecific<T>>,
  predicate: (value: T) => boolean | BrowserSpecific<boolean>
): BrowserSpecific<List<T>>;

export function filter<T>(
  values: ArrayLike<T | BrowserSpecific<T>>,
  predicate: (value: T) => boolean | BrowserSpecific<boolean>
): List<T> | BrowserSpecific<List<T>>;

export function filter<T>(
  values: ArrayLike<T>,
  predicate: (value: T) => boolean
): List<T>;

export function filter<T>(
  values: ArrayLike<T | BrowserSpecific<T>>,
  predicate: (value: T) => boolean | BrowserSpecific<boolean>
): List<T> | BrowserSpecific<List<T>> {
  return reduce<T, List<T>>(
    values,
    (filtered, value) => {
      return map(predicate(value), include => {
        return include ? filtered.push(value) : filtered;
      });
    },
    List()
  );
}
