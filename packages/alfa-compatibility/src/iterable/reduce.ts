import { Seq } from "@siteimprove/alfa-collection";
import { BrowserSpecific } from "../browser-specific";

const { map } = BrowserSpecific;

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
  return map(values, values => {
    if (initial === undefined) {
      return Seq(values).reduce((accumulator, value) => {
        return map(accumulator, accumulator => {
          return iteratee(accumulator, value);
        });
      });
    }

    return Seq(values).reduce((accumulator, value) => {
      return map(accumulator, accumulator => {
        return iteratee(accumulator, value);
      });
    }, initial);
  });
}
