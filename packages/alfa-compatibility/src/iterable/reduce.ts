import { BrowserSpecific } from "../browser-specific";

export function reduce<T>(
  values: BrowserSpecific<Iterable<T>>,
  iteratee: (accumulator: T, value: T) => T | BrowserSpecific<T>
): BrowserSpecific<T>;

export function reduce<T, U>(
  values: BrowserSpecific<Iterable<T>>,
  iteratee: (accumulator: U, value: T) => U | BrowserSpecific<U>,
  initial: U | BrowserSpecific<U>
): BrowserSpecific<U>;

export function reduce<T>(
  values: Iterable<T> | BrowserSpecific<Iterable<T>>,
  iteratee: (accumulator: T, value: T) => T | BrowserSpecific<T>
): T | BrowserSpecific<T>;

export function reduce<T, U>(
  values: Iterable<T> | BrowserSpecific<Iterable<T>>,
  iteratee: (accumulator: U, value: T) => U | BrowserSpecific<U>,
  initial: U | BrowserSpecific<U>
): U | BrowserSpecific<U>;

export function reduce<T>(
  values: Iterable<T>,
  iteratee: (accumulator: T, value: T) => T
): T;

export function reduce<T, U>(
  values: Iterable<T>,
  iteratee: (accumulator: U, value: T) => U,
  initial: U
): U;

export function reduce<T, U = T>(
  values: Iterable<T> | BrowserSpecific<Iterable<T>>,
  iteratee: (accumulator: T | U, value: T) => T | U,
  initial?: T | U | BrowserSpecific<T | U>
): T | U | BrowserSpecific<T | U> {
  return BrowserSpecific.map(values, values => {
    const iterator = values[Symbol.iterator]();

    let next = iterator.next();

    if (initial === undefined) {
      if (next.done === true) {
        throw new TypeError("reduce of empty iterable with no initial value");
      }

      initial = next.value;
      next = iterator.next();
    }

    let accumulator = initial;

    while (next.done !== true) {
      const { value } = next;

      accumulator = BrowserSpecific.map(accumulator, accumulator => {
        return iteratee(accumulator, value);
      });

      next = iterator.next();
    }

    return accumulator;
  });
}
