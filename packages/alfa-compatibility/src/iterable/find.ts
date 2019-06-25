import { Option, Some } from "@siteimprove/alfa-util";
import { BrowserSpecific } from "../browser-specific";
import { reduce } from "./reduce";

const { map } = BrowserSpecific;

export function find<T>(
  values: BrowserSpecific<Iterable<Option<T>>>,
  predicate: (value: Some<T>) => boolean | BrowserSpecific<boolean>
): BrowserSpecific<Option<T>>;

export function find<T>(
  values: Iterable<Option<T>> | BrowserSpecific<Iterable<Option<T>>>,
  predicate: (value: Some<T>) => boolean | BrowserSpecific<boolean>
): Option<T> | BrowserSpecific<Option<T>>;

export function find<T>(
  values: Iterable<Option<T>>,
  predicate: (value: Some<T>) => boolean
): Option<T>;

export function find<T>(
  values: Iterable<Option<T>> | BrowserSpecific<Iterable<Option<T>>>,
  predicate: (value: Some<T>) => boolean | BrowserSpecific<boolean>
): Option<T> | BrowserSpecific<Option<T>> {
  return reduce<Option<T>, Option<T>>(
    values,
    (found, value) => {
      if (found === null && value !== null) {
        return map(predicate(value), match => (match ? value : null));
      }

      return found;
    },
    null
  );
}
