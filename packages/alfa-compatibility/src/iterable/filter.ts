import { List } from "@siteimprove/alfa-collection";
import { BrowserSpecific } from "../browser-specific";
import { reduce } from "./reduce";

export function filter<T>(
  values: BrowserSpecific<Iterable<T>>,
  predicate: (value: T) => boolean | BrowserSpecific<boolean>
): BrowserSpecific<Iterable<T>>;

export function filter<T>(
  values: Iterable<T> | BrowserSpecific<Iterable<T>>,
  predicate: (value: T) => boolean | BrowserSpecific<boolean>
): Iterable<T> | BrowserSpecific<Iterable<T>>;

export function filter<T>(
  values: Iterable<T>,
  predicate: (value: T) => boolean
): Iterable<T>;

export function filter<T>(
  values: Iterable<T> | BrowserSpecific<Iterable<T>>,
  predicate: (value: T) => boolean | BrowserSpecific<boolean>
): Iterable<T> | BrowserSpecific<Iterable<T>> {
  return reduce<T, List<T>>(
    values,
    (filtered, value) => {
      return BrowserSpecific.map(predicate(value), include => {
        return include ? filtered.push(value) : filtered;
      });
    },
    List()
  );
}
