import { BrowserSpecific } from "./browser-specific";
import { map } from "./map";
import { reduce } from "./reduce";

export function filter<T>(
  values: ArrayLike<BrowserSpecific<T>>,
  predicate: (value: T) => boolean | BrowserSpecific<boolean>
): BrowserSpecific<Array<T>>;

export function filter<T>(
  values: ArrayLike<T | BrowserSpecific<T>>,
  predicate: (value: T) => boolean | BrowserSpecific<boolean>
): Array<T> | BrowserSpecific<Array<T>>;

export function filter<T>(
  values: ArrayLike<T>,
  predicate: (value: T) => boolean
): Array<T>;

export function filter<T>(
  values: ArrayLike<T | BrowserSpecific<T>>,
  predicate: (value: T) => boolean | BrowserSpecific<boolean>
): Array<T> | BrowserSpecific<Array<T>> {
  return reduce<T, Array<T>>(
    values,
    (filtered, value) => {
      return map(predicate(value), include => {
        return include ? [...filtered, value] : filtered;
      });
    },
    []
  );
}
