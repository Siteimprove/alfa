import { BrowserSpecific } from "./browser-specific";
import { map } from "./map";
import { reduce } from "./reduce";

export function filter<T>(
  values: ArrayLike<T | BrowserSpecific<T>>,
  predicate: (value: T) => boolean | BrowserSpecific<boolean>
): BrowserSpecific<Array<T>>;

export function filter<T>(
  values: ArrayLike<T>,
  predicate: (value: T) => boolean
): Array<T>;

export function filter<T>(
  values: ArrayLike<T | BrowserSpecific<T>>,
  predicate: (value: T) => boolean | BrowserSpecific<boolean>
): Array<T> | BrowserSpecific<Array<T>> {
  return reduce(
    values,
    (filtered, value) =>
      map(predicate(value), include =>
        include ? [...filtered, value] : filtered
      ),
    [] as Array<T> | BrowserSpecific<Array<T>>
  );
}
