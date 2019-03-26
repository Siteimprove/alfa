import { BrowserSpecific } from "./browser-specific";
import { map } from "./map";

export function reduce<T>(
  values: ArrayLike<BrowserSpecific<T>>,
  iteratee: (accumulator: T, value: T) => T | BrowserSpecific<T>
): BrowserSpecific<T>;

export function reduce<T, U>(
  values: ArrayLike<BrowserSpecific<T>>,
  iteratee: (accumulator: U, value: T) => U | BrowserSpecific<U>,
  initial: U | BrowserSpecific<U>
): BrowserSpecific<U>;

export function reduce<T>(
  values: ArrayLike<T | BrowserSpecific<T>>,
  iteratee: (accumulator: T, value: T) => T | BrowserSpecific<T>
): T | BrowserSpecific<T>;

export function reduce<T, U>(
  values: ArrayLike<T | BrowserSpecific<T>>,
  iteratee: (accumulator: U, value: T) => U | BrowserSpecific<U>,
  initial: U | BrowserSpecific<U>
): U | BrowserSpecific<U>;

export function reduce<T>(
  values: ArrayLike<T>,
  iteratee: (accumulator: T, value: T) => T
): T;

export function reduce<T, U>(
  values: ArrayLike<T>,
  iteratee: (accumulator: U, value: T) => U,
  initial: U
): U;

export function reduce<T, U = T>(
  values: ArrayLike<T | BrowserSpecific<T>>,
  iteratee: (accumulator: T | U, value: T) => T | U,
  initial?: T | U | BrowserSpecific<T | U>
): T | U | BrowserSpecific<T | U> {
  let i = 0;
  let accumulator = initial === undefined ? values[i++] : initial;

  for (const n = values.length; i < n; i++) {
    accumulator = map(accumulator, accumulator =>
      map(values[i], value => iteratee(accumulator, value))
    );
  }

  return accumulator;
}
