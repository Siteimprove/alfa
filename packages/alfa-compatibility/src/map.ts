import { BrowserSpecific } from "./browser-specific";
import { isBrowserSpecific } from "./is-browser-specific";

export function map<T, U>(
  value: BrowserSpecific<T>,
  iteratee: (value: T) => U
): BrowserSpecific<U>;

export function map<T, U>(value: T, iteratee: (value: T) => U): U;

export function map<T, U>(
  value: T | BrowserSpecific<T>,
  iteratee: (value: T) => U
): U | BrowserSpecific<U> {
  if (isBrowserSpecific(value)) {
    return new BrowserSpecific(
      value.values.map(({ value, browsers }) => {
        return {
          value: iteratee(value),
          browsers
        };
      })
    );
  }

  return iteratee(value);
}
