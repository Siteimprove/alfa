import { BrowserSpecific } from "./browser-specific";
import { flatMap } from "./flat-map";
import { isBrowserSpecific } from "./is-browser-specific";

export function combine<T, U, V>(
  value: T | BrowserSpecific<T>,
  other: BrowserSpecific<U>,
  iteratee: (value: T, other: U) => V | BrowserSpecific<V>
): BrowserSpecific<V>;

export function combine<T, U, V>(
  value: BrowserSpecific<T>,
  other: U | BrowserSpecific<U>,
  iteratee: (value: T, other: U) => V | BrowserSpecific<V>
): BrowserSpecific<V>;

export function combine<T, U, V>(
  value: T,
  other: U,
  iteratee: (value: T, other: U) => V
): V;

export function combine<T, U, V>(
  value: T | BrowserSpecific<T>,
  other: U | BrowserSpecific<U>,
  iteratee: (value: T, other: U) => V | BrowserSpecific<V>
): V | BrowserSpecific<V> {
  if (isBrowserSpecific(value)) {
    if (isBrowserSpecific(other)) {
      return flatMap(value, value =>
        flatMap(other, other => iteratee(value, other))
      );
    }

    return flatMap(value, value => iteratee(value, other));
  }

  if (isBrowserSpecific(other)) {
    return flatMap(other, other => iteratee(value, other));
  }

  return iteratee(value, other);
}
