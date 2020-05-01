import { Equatable } from "@siteimprove/alfa-equatable";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";

const { not, isObject } = Predicate;

export interface Iterable<T> {
  [Symbol.iterator](): Iterator<T>;
}

export namespace Iterable {
  export function isIterable<T>(value: unknown): value is Iterable<T> {
    return isObject(value) && Symbol.iterator in value;
  }

  export function* from<T>(arrayLike: ArrayLike<T>): Iterable<T> {
    for (let i = 0, n = arrayLike.length; i < n; i++) {
      yield arrayLike[i];
    }
  }

  export function* empty<T>(): Iterable<T> {}

  export function size<T>(iterable: Iterable<T>): number {
    return reduce(iterable, (size) => size + 1, 0);
  }

  export function isEmpty<T>(
    iterable: Iterable<T>
  ): iterable is Iterable<never> {
    for (const _ of iterable) {
      return false;
    }

    return true;
  }

  export function* map<T, U = T>(
    iterable: Iterable<T>,
    mapper: Mapper<T, U, [number]>
  ): Iterable<U> {
    let index = 0;

    for (const value of iterable) {
      yield mapper(value, index);
    }
  }

  export function* flatMap<T, U = T>(
    iterable: Iterable<T>,
    mapper: Mapper<T, Iterable<U>>
  ): Iterable<U> {
    let index = 0;

    for (const value of iterable) {
      yield* mapper(value, index++);
    }
  }

  export function* flatten<T>(iterable: Iterable<Iterable<T>>): Iterable<T> {
    for (const value of iterable) {
      yield* value;
    }
  }

  export function reduce<T, U = T>(
    iterable: Iterable<T>,
    reducer: Reducer<T, U, [number]>,
    accumulator: U
  ): U {
    let index = 0;

    for (const value of iterable) {
      accumulator = reducer(accumulator, value, index++);
    }

    return accumulator;
  }

  export function* filter<T, U extends T = T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, U, [number]>
  ): Iterable<U> {
    let index = 0;

    for (const value of iterable) {
      if (predicate(value, index++)) {
        yield value;
      }
    }
  }

  export function find<T, U extends T = T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, U, [number]>
  ): Option<U> {
    let index = 0;

    for (const value of iterable) {
      if (predicate(value, index++)) {
        return Some.of(value);
      }
    }

    return None;
  }

  export function includes<T>(iterable: Iterable<T>, value: T): boolean {
    return some(iterable, Predicate.equals(value));
  }

  export function some<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, T, [number]>
  ): boolean {
    let index = 0;

    for (const value of iterable) {
      if (predicate(value, index++)) {
        return true;
      }
    }

    return false;
  }

  export function every<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, T, [number]>
  ): boolean {
    let index = 0;

    for (const value of iterable) {
      if (!predicate(value, index++)) {
        return false;
      }
    }

    return true;
  }

  export function count<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, T, [number]>
  ): number {
    return reduce(
      iterable,
      (count, value, index) => (predicate(value, index) ? count + 1 : count),
      0
    );
  }

  export function get<T>(iterable: Iterable<T>, index: number): Option<T> {
    return index < 0 ? None : first(skip(iterable, index));
  }

  export function has<T>(iterable: Iterable<T>, index: number): boolean {
    return index < 0 ? false : !isEmpty(skip(iterable, index));
  }

  export function* concat<T>(...iterables: Array<Iterable<T>>): Iterable<T> {
    for (const iterable of iterables) {
      yield* iterable;
    }
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

  export function* take<T>(iterable: Iterable<T>, count: number): Iterable<T> {
    const iterator = iterable[Symbol.iterator]();

    while (count-- > 0) {
      const next = iterator.next();

      if (next.done === true) {
        return;
      }

      yield next.value;
    }
  }

  export function* takeWhile<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, T, [number]>
  ): Iterable<T> {
    let index = 0;

    for (const value of iterable) {
      if (predicate(value, index++)) {
        yield value;
      } else {
        break;
      }
    }
  }

  export function takeUntil<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, T, [number]>
  ): Iterable<T> {
    return takeWhile(iterable, not(predicate));
  }

  export function* takeLast<T>(
    iterable: Iterable<T>,
    count: number = 1
  ): Iterable<T> {
    if (count <= 0) {
      return;
    }

    const last: Array<T> = [];

    for (const value of iterable) {
      last.push(value);

      if (last.length > count) {
        last.shift();
      }
    }

    yield* last;
  }

  export function* skip<T>(iterable: Iterable<T>, count: number): Iterable<T> {
    const iterator = iterable[Symbol.iterator]();

    while (count-- > 0) {
      const next = iterator.next();

      if (next.done === true) {
        return;
      }
    }

    while (true) {
      const next = iterator.next();

      if (next.done === true) {
        return;
      }

      yield next.value;
    }
  }

  export function* skipWhile<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, T, [number]>
  ): Iterable<T> {
    let index = 0;
    let skipped = false;

    for (const value of iterable) {
      if (!skipped && predicate(value, index++)) {
        continue;
      } else {
        skipped = true;
        yield value;
      }
    }
  }

  export function skipUntil<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, T, [number]>
  ): Iterable<T> {
    return skipWhile(iterable, not(predicate));
  }

  export function* skipLast<T>(
    iterable: Iterable<T>,
    count: number = 1
  ): Iterable<T> {
    const iterator = iterable[Symbol.iterator]();

    const first: Array<T> = [];

    while (count-- > 0) {
      const next = iterator.next();

      if (next.done === true) {
        return;
      }

      first.push(next.value);
    }

    while (true) {
      const next = iterator.next();

      if (next.done === true) {
        return;
      }

      first.push(next.value);

      yield first.shift()!;
    }
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

  export function equals<T>(a: Iterable<T>, b: Iterable<T>): boolean {
    const ita = a[Symbol.iterator]();
    const itb = b[Symbol.iterator]();

    while (true) {
      const a = ita.next();
      const b = itb.next();

      switch (a.done) {
        case true:
          return b.done === true;

        default:
          if (b.done === true || !Equatable.equals(a.value, b.value)) {
            return false;
          }
      }
    }
  }

  export function subtract<T>(
    left: Iterable<T>,
    right: Iterable<T>
  ): Iterable<T> {
    return filter(left, (left) => !includes(right, left));
  }

  export function intersect<T>(
    left: Iterable<T>,
    right: Iterable<T>
  ): Iterable<T> {
    return filter(left, (left) => includes(right, left));
  }

  export function groupBy<T, K>(
    iterable: Iterable<T>,
    grouper: Mapper<T, K, [number]>
  ): Iterable<[K, Iterable<T>]> {
    const groups: Array<[K, Array<T>]> = [];

    let index = 0;

    for (const value of iterable) {
      const group = grouper(value, index++);

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
}
