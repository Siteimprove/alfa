import { Option, Some } from "@siteimprove/alfa-util";
import { BrowserSpecific } from "./browser-specific";
import { map } from "./map";
import { reduce } from "./reduce";

export function find<T>(
  values: ArrayLike<BrowserSpecific<Option<T>>>,
  predicate: (value: Some<T>) => boolean | BrowserSpecific<boolean>
): BrowserSpecific<Option<T>>;

export function find<T>(
  values: ArrayLike<Option<T> | BrowserSpecific<Option<T>>>,
  predicate: (value: Some<T>) => boolean | BrowserSpecific<boolean>
): Option<T> | BrowserSpecific<Option<T>>;

export function find<T>(
  values: ArrayLike<Option<T>>,
  predicate: (value: Some<T>) => boolean
): Option<T>;

export function find<T>(
  values: ArrayLike<Option<T> | BrowserSpecific<Option<T>>>,
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
