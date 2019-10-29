import { Equality } from "@siteimprove/alfa-compare";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";

export namespace Iterable {
  export function* map<T, U>(
    iterable: Iterable<T>,
    mapper: Mapper<T, U>
  ): Iterable<U> {
    for (const value of iterable) {
      yield mapper(value);
    }
  }

  export function* flatMap<T, U>(
    iterable: Iterable<T>,
    mapper: Mapper<T, Iterable<U>>
  ): Iterable<U> {
    for (const value of iterable) {
      yield* mapper(value);
    }
  }

  export function reduce<T, U>(
    iterable: Iterable<T>,
    reducer: Reducer<T, U>,
    accumulator: U
  ): U {
    for (const value of iterable) {
      accumulator = reducer(accumulator, value);
    }

    return accumulator;
  }

  export function includes<T>(iterable: Iterable<T>, value: T): boolean {
    for (const found of iterable) {
      if (Equality.equals(value, found)) {
        return true;
      }
    }

    return false;
  }

  export function find<T, U extends T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, U>
  ): Option<U> {
    for (const value of iterable) {
      if (Predicate.test(predicate, value)) {
        return Some.of(value);
      }
    }

    return None;
  }

  export function* filter<T, U extends T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, U>
  ): Iterable<U> {
    for (const value of iterable) {
      if (Predicate.test(predicate, value)) {
        yield value;
      }
    }
  }

  export function subtract<T>(
    left: Iterable<T>,
    right: Iterable<T>
  ): Iterable<T> {
    return filter(left, left => !includes(right, left));
  }

  export function intersect<T>(
    left: Iterable<T>,
    right: Iterable<T>
  ): Iterable<T> {
    return filter(left, left => includes(right, left));
  }

  export function isIterable<T>(value: unknown): value is Iterable<T> {
    return (
      typeof value === "object" && value !== null && Symbol.iterator in value
    );
  }
}
