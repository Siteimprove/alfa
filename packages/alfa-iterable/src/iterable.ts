import { Equality } from "@siteimprove/alfa-equality";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";

const { equals } = Predicate;

export interface Iterable<T> {
  [Symbol.iterator](): Iterator<T>;
}

export namespace Iterable {
  export function* from<T>(arrayLike: ArrayLike<T>): Iterable<T> {
    for (let i = 0, n = arrayLike.length; i < n; i++) {
      yield arrayLike[i];
    }
  }

  export function* empty<T>(): Iterable<T> {}

  export function* map<T, U = T>(
    iterable: Iterable<T>,
    mapper: Mapper<T, U>
  ): Iterable<U> {
    for (const value of iterable) {
      yield mapper(value);
    }
  }

  export function* flatMap<T, U = T>(
    iterable: Iterable<T>,
    mapper: Mapper<T, Iterable<U>>
  ): Iterable<U> {
    for (const value of iterable) {
      yield* mapper(value);
    }
  }

  export function flatten<T>(iterable: Iterable<Iterable<T>>): Iterable<T> {
    return flatMap(iterable, iterable => iterable);
  }

  export function reduce<T, U = T>(
    iterable: Iterable<T>,
    reducer: Reducer<T, U>,
    accumulator: U
  ): U {
    for (const value of iterable) {
      accumulator = reducer(accumulator, value);
    }

    return accumulator;
  }

  export function* concat<T>(...iterables: Array<Iterable<T>>): Iterable<T> {
    for (const iterable of iterables) {
      yield* iterable;
    }
  }

  export function includes<T>(iterable: Iterable<T>, value: T): boolean {
    return some(iterable, equals(value));
  }

  export function find<T, U extends T = T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, U>
  ): Option<U> {
    for (const value of iterable) {
      if (predicate(value)) {
        return Some.of(value);
      }
    }

    return None;
  }

  export function some<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T>
  ): boolean {
    for (const value of iterable) {
      if (predicate(value)) {
        return true;
      }
    }

    return false;
  }

  export function every<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T>
  ): boolean {
    for (const value of iterable) {
      if (!predicate(value)) {
        return false;
      }
    }

    return true;
  }

  export function* filter<T, U extends T = T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, U>
  ): Iterable<U> {
    for (const value of iterable) {
      if (predicate(value)) {
        yield value;
      }
    }
  }

  export function first<T>(iterable: Iterable<T>): Option<T> {
    for (const value of iterable) {
      return Some.of(value);
    }

    return None;
  }

  export function groupBy<T, K>(
    iterable: Iterable<T>,
    grouper: Mapper<T, K>
  ): Iterable<[K, Iterable<T>]> {
    const groups: Array<[K, Array<T>]> = [];

    for (const value of iterable) {
      const group = grouper(value);

      const existing = groups.find(([existing]) =>
        Equality.equals(group, existing)
      );

      if (existing === undefined) {
        groups.push([group, [value]]);
      } else {
        existing[1].push(value);
      }
    }

    return groups;
  }

  export function join(iterable: Iterable<string>, separator: string): string {
    const iterator = iterable[Symbol.iterator]();

    let next = iterator.next();

    if (next.done === true) {
      return "";
    }

    let result = next.value;
    next = iterator.next();

    while (next.done !== true) {
      result += separator + next.value;
      next = iterator.next();
    }

    return result;
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
