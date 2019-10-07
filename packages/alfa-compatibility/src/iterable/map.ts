import { List } from "@siteimprove/alfa-collection";
import { BrowserSpecific } from "../browser-specific";
import { reduce } from "./reduce";

export function map<T, U>(
  values: BrowserSpecific.Maybe<Iterable<T>>,
  iteratee: (value: T) => BrowserSpecific.Maybe<U>
): BrowserSpecific.Maybe<Iterable<U>>;

export function map<T, U>(
  values: Iterable<T>,
  iteratee: (value: T) => U
): Iterable<U>;

export function map<T, U>(
  values: BrowserSpecific.Maybe<Iterable<T>>,
  iteratee: (value: T) => BrowserSpecific.Maybe<U>
): BrowserSpecific.Maybe<Iterable<U>> {
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
