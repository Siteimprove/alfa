import { BrowserSpecific } from "./browser-specific";
import { isBrowserSpecific } from "./is-browser-specific";
import { map } from "./map";

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
      return map(value, value => map(other, other => iteratee(value, other)));
    }

    return map(value, value => iteratee(value, other));
  }

  if (isBrowserSpecific(other)) {
    return map(other, other => iteratee(value, other));
  }

  return iteratee(value, other);
}
