import { Equatable } from "@siteimprove/alfa-equatable";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";

const { not, equals } = Predicate;

export interface Iterable<T> {
  [Symbol.iterator](): Iterator<T>;
}

export namespace Iterable {
  export function isIterable<T>(value: unknown): value is Iterable<T> {
    return (
      typeof value === "object" && value !== null && Symbol.iterator in value
    );
  }

  export function* from<T>(arrayLike: ArrayLike<T>): Iterable<T> {
    for (let i = 0, n = arrayLike.length; i < n; i++) {
      yield arrayLike[i];
    }
  }

  export function* empty<T>(): Iterable<T> {}

  export function isEmpty<T>(iterable: Iterable<T>): boolean {
    for (const _ of iterable) {
      return false;
    }

    return true;
  }

  export function size<T>(iterable: Iterable<T>): number {
    return reduce(iterable, size => size + 1, 0);
  }

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

  export function count<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T>
  ): number {
    return reduce(
      iterable,
      (count, value) => (predicate(value) ? count + 1 : count),
      0
    );
  }

  export function get<T>(iterable: Iterable<T>, index: number): Option<T> {
    return first(skip(iterable, index));
  }

  export function first<T>(iterable: Iterable<T>): Option<T> {
    for (const value of iterable) {
      return Option.of(value);
    }

    return None;
  }

  export function last<T>(iterable: Iterable<T>): Option<T> {
    let last: T | null = null;

    for (const value of iterable) {
      last = value;
    }

    return Option.from(last);
  }

  export function take<T>(iterable: Iterable<T>, count: number): Iterable<T> {
    return takeWhile(iterable, () => count-- > 0);
  }

  export function* takeWhile<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T>
  ): Iterable<T> {
    for (const value of iterable) {
      if (predicate(value)) {
        yield value;
      } else {
        break;
      }
    }
  }

  export function takeUntil<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T>
  ): Iterable<T> {
    return takeWhile(iterable, not(predicate));
  }

  export function skip<T>(iterable: Iterable<T>, count: number): Iterable<T> {
    return skipWhile(iterable, () => count-- > 0);
  }

  export function* skipWhile<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T>
  ): Iterable<T> {
    let skipped = false;

    for (const value of iterable) {
      if (!skipped && predicate(value)) {
        continue;
      } else {
        skipped = true;
        yield value;
      }
    }
  }

  export function skipUntil<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T>
  ): Iterable<T> {
    return skipWhile(iterable, not(predicate));
  }

  export function rest<T>(iterable: Iterable<T>): Iterable<T> {
    return skip(iterable, 1);
  }

  export function slice<T>(
    iterable: Iterable<T>,
    start: number,
    end?: number
  ): Iterable<T> {
    iterable = skip(iterable, start);

    if (end !== undefined) {
      iterable = take(iterable, end - start);
    }

    return iterable;
  }

  export function* reverse<T>(iterable: Iterable<T>): Iterable<T> {
    const array = Array.from(iterable);

    for (let i = array.length - 1; i >= 0; i--) {
      yield array[i];
    }
  }

  export function groupBy<T, K>(
    iterable: Iterable<T>,
    grouper: Mapper<T, K>
  ): Iterable<[K, Iterable<T>]> {
    const groups: Array<[K, Array<T>]> = [];

    for (const value of iterable) {
      const group = grouper(value);

      const existing = groups.find(([existing]) =>
        Equatable.equals(group, existing)
      );

      if (existing === undefined) {
        groups.push([group, [value]]);
      } else {
        existing[1].push(value);
      }
    }

    return groups;
  }

  export function join<T>(iterable: Iterable<T>, separator: string): string {
    const iterator = iterable[Symbol.iterator]();

    let next = iterator.next();

    if (next.done === true) {
      return "";
    }

    let result = `${next.value}`;
    next = iterator.next();

    while (next.done !== true) {
      result += `${separator}${next.value}`;
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
}
