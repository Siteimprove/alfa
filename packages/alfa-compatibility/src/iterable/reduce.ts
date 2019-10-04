import { BrowserSpecific } from "../browser-specific";

export function reduce<T>(
  values: BrowserSpecific.Maybe<Iterable<T>>,
  iteratee: (accumulator: T, value: T) => BrowserSpecific.Maybe<T>
): BrowserSpecific.Maybe<T>;

export function reduce<T, U>(
  values: BrowserSpecific.Maybe<Iterable<T>>,
  iteratee: (accumulator: U, value: T) => BrowserSpecific.Maybe<U>,
  initial: BrowserSpecific.Maybe<U>
): BrowserSpecific.Maybe<U>;

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
  values: BrowserSpecific.Maybe<Iterable<T>>,
  iteratee: (accumulator: T | U, value: T) => BrowserSpecific.Maybe<T | U>,
  initial?: BrowserSpecific.Maybe<T | U>
): BrowserSpecific.Maybe<T | U> {
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
