import { List } from "@siteimprove/alfa-collection";
import { BrowserSpecific } from "../browser-specific";
import { reduce } from "./reduce";

export function map<T, U>(
  values: BrowserSpecific<Iterable<T>>,
  iteratee: (value: T) => U | BrowserSpecific<U>
): BrowserSpecific<Iterable<U>>;

export function map<T, U>(
  values: Iterable<T> | BrowserSpecific<Iterable<T>>,
  iteratee: (value: T) => U | BrowserSpecific<U>
): Iterable<U> | BrowserSpecific<Iterable<U>>;

export function map<T, U>(
  values: Iterable<T>,
  iteratee: (value: T) => U
): Iterable<U>;

export function map<T, U>(
  values: Iterable<T> | BrowserSpecific<Iterable<T>>,
  iteratee: (value: T) => U | BrowserSpecific<U>
): Iterable<U> | BrowserSpecific<Iterable<U>> {
  return reduce<T, List<U>>(
    values,
    (result, value) => {
      return BrowserSpecific.map(iteratee(value), value => {
        return result.push(value);
      });
    },
    List()
  );
}
