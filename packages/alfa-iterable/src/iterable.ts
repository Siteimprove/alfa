import type { Callback } from "@siteimprove/alfa-callback";
import {
  Comparable,
  type Comparer,
  Comparison,
} from "@siteimprove/alfa-comparable";
import { Equatable } from "@siteimprove/alfa-equatable";
import type { Hash } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import type { Mapper } from "@siteimprove/alfa-mapper";
import { Option, None } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import type { Reducer } from "@siteimprove/alfa-reducer";
import { Refinement } from "@siteimprove/alfa-refinement";

const { not } = Predicate;
const { isObject } = Refinement;
const { compareComparable } = Comparable;

/**
 * @remarks
 * This is a re-export of the global `Iterable` interface to ensure that it
 * merges with the `Iterable` namespace.
 *
 * @public
 */
export type Iterable<T> = globalThis.Iterable<T>;

/**
 * @public
 */
export namespace Iterable {
  export function isIterable<T>(value: unknown): value is Iterable<T> {
    return isObject(value) && Symbol.iterator in value;
  }

  export function* empty<T>(): Iterable<T> {}

  export function* from<T>(arrayLike: ArrayLike<T>): Iterable<T> {
    for (let i = 0, n = arrayLike.length; i < n; i++) {
      yield arrayLike[i];
    }
  }

  export function size<T>(iterable: Iterable<T>): number {
    return reduce(iterable, (size) => size + 1, 0);
  }

  export function isEmpty<T>(
    iterable: Iterable<T>,
  ): iterable is Iterable<never> {
    for (const _ of iterable) {
      return false;
    }

    return true;
  }

  export function forEach<T>(
    iterable: Iterable<T>,
    callback: Callback<T, void, [index: number]>,
  ): void {
    let index = 0;

    for (const value of iterable) {
      callback(value, index++);
    }
  }

  export function* map<T, U = T>(
    iterable: Iterable<T>,
    mapper: Mapper<T, U, [index: number]>,
  ): Iterable<U> {
    let index = 0;

    for (const value of iterable) {
      yield mapper(value, index++);
    }
  }

  export function* flatMap<T, U = T>(
    iterable: Iterable<T>,
    mapper: Mapper<T, Iterable<U>, [index: number]>,
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
    reducer: Reducer<T, U, [index: number]>,
    accumulator: U,
  ): U {
    let index = 0;

    for (const value of iterable) {
      accumulator = reducer(accumulator, value, index++);
    }

    return accumulator;
  }

  export function reduceWhile<T, U = T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, [index: number]>,
    reducer: Reducer<T, U, [index: number]>,
    accumulator: U,
  ): U {
    let index = 0;

    for (const value of iterable) {
      if (predicate(value, index)) {
        accumulator = reducer(accumulator, value, index++);
      } else {
        break;
      }
    }

    return accumulator;
  }

  export function reduceUntil<T, U = T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, [index: number]>,
    reducer: Reducer<T, U, [index: number]>,
    accumulator: U,
  ): U {
    return reduceWhile(iterable, not(predicate), reducer, accumulator);
  }

  export function apply<T, U>(
    iterable: Iterable<T>,
    mapper: Iterable<Mapper<T, U>>,
  ): Iterable<U> {
    return flatMap(mapper, (mapper) => map(iterable, mapper));
  }

  export function filter<T, U extends T>(
    iterable: Iterable<T>,
    refinement: Refinement<T, U, [index: number]>,
  ): Iterable<U>;

  export function filter<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, [index: number]>,
  ): Iterable<T>;

  export function* filter<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, [index: number]>,
  ): Iterable<T> {
    let index = 0;

    for (const value of iterable) {
      if (predicate(value, index++)) {
        yield value;
      }
    }
  }

  export function reject<T, U extends T>(
    iterable: Iterable<T>,
    refinement: Refinement<T, U, [index: number]>,
  ): Iterable<Exclude<T, U>>;

  export function reject<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, [index: number]>,
  ): Iterable<T>;

  export function reject<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, [index: number]>,
  ): Iterable<T> {
    return filter(iterable, not(predicate));
  }

  export function find<T, U extends T>(
    iterable: Iterable<T>,
    refinement: Refinement<T, U, [index: number]>,
  ): Option<U>;

  export function find<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, [index: number]>,
  ): Option<T>;

  export function find<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, [index: number]>,
  ): Option<T> {
    let index = 0;

    for (const value of iterable) {
      if (predicate(value, index++)) {
        return Option.of(value);
      }
    }

    return None;
  }

  export function findLast<T, U extends T>(
    iterable: Iterable<T>,
    refinement: Refinement<T, U, [index: number]>,
  ): Option<U>;

  export function findLast<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, [index: number]>,
  ): Option<T>;

  export function findLast<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, [index: number]>,
  ): Option<T> {
    let index = 0;
    let result: Option<T> = None;

    for (const value of iterable) {
      if (predicate(value, index++)) {
        result = Option.of(value);
      }
    }

    return result;
  }

  export function includes<T>(iterable: Iterable<T>, value: T): boolean {
    return some(iterable, Predicate.equals(value));
  }

  export function collect<T, U>(
    iterable: Iterable<T>,
    mapper: Mapper<T, Option<U>, [index: number]>,
  ): Iterable<U> {
    return flatMap(iterable, mapper);
  }

  export function collectFirst<T, U>(
    iterable: Iterable<T>,
    mapper: Mapper<T, Option<U>, [index: number]>,
  ): Option<U> {
    return first(collect(iterable, mapper));
  }

  export function some<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, [index: number]>,
  ): boolean {
    let index = 0;

    for (const value of iterable) {
      if (predicate(value, index++)) {
        return true;
      }
    }

    return false;
  }

  export function none<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, [index: number]>,
  ): boolean {
    return every(iterable, not(predicate));
  }

  export function every<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, [index: number]>,
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
    predicate: Predicate<T, [index: number]>,
  ): number {
    return reduce(
      iterable,
      (count, value, index) => (predicate(value, index) ? count + 1 : count),
      0,
    );
  }

  export function* distinct<T>(iterable: Iterable<T>): Iterable<T> {
    const seen: Array<T> = [];

    for (const value of iterable) {
      if (seen.some(Predicate.equals(value))) {
        continue;
      }

      seen.push(value);

      yield value;
    }
  }

  export function get<T>(iterable: Iterable<T>, index: number): Option<T> {
    return index < 0 ? None : first(skip(iterable, index));
  }

  export function has<T>(iterable: Iterable<T>, index: number): boolean {
    return index < 0 ? false : !isEmpty(skip(iterable, index));
  }

  export function* set<T>(
    iterable: Iterable<T>,
    index: number,
    value: T,
  ): Iterable<T> {
    const it = iterator(iterable);

    while (index-- > 0) {
      const next = it.next();

      if (next.done === true) {
        return;
      }

      yield next.value;
    }

    const next = it.next();

    if (next.done === true) {
      return;
    }

    yield value;

    while (true) {
      const next = it.next();

      if (next.done === true) {
        return;
      }

      yield next.value;
    }
  }

  export function* insert<T>(
    iterable: Iterable<T>,
    index: number,
    value: T,
  ): Iterable<T> {
    const it = iterator(iterable);

    while (index-- > 0) {
      const next = it.next();

      if (next.done === true) {
        return;
      }

      yield next.value;
    }

    yield value;

    while (true) {
      const next = it.next();

      if (next.done === true) {
        return;
      }

      yield next.value;
    }
  }

  export function* append<T>(iterable: Iterable<T>, value: T): Iterable<T> {
    yield* iterable;
    yield value;
  }

  export function* prepend<T>(iterable: Iterable<T>, value: T): Iterable<T> {
    yield value;
    yield* iterable;
  }

  export function* concat<T>(
    iterable: Iterable<T>,
    ...iterables: Array<Iterable<T>>
  ): Iterable<T> {
    yield* iterable;

    for (const iterable of iterables) {
      yield* iterable;
    }
  }

  export function subtract<T>(
    iterable: Iterable<T>,
    ...iterables: Array<Iterable<T>>
  ): Iterable<T> {
    return reject(iterable, (value) => includes(flatten(iterables), value));
  }

  export function intersect<T>(
    iterable: Iterable<T>,
    ...iterables: Array<Iterable<T>>
  ): Iterable<T> {
    return filter(iterable, (value) => includes(flatten(iterables), value));
  }

  export function* zip<T, U = T>(
    a: Iterable<T>,
    b: Iterable<U>,
  ): Iterable<[T, U]> {
    const itA = iterator(a);
    const itB = iterator(b);

    while (true) {
      const a = itA.next();
      const b = itB.next();

      if (a.done === true || b.done === true) {
        return;
      }

      yield [a.value, b.value];
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
    const it = iterator(iterable);

    while (count-- > 0) {
      const next = it.next();

      if (next.done === true) {
        return;
      }

      yield next.value;
    }
  }

  export function takeWhile<T, U extends T>(
    iterable: Iterable<T>,
    refinement: Refinement<T, U, [index: number]>,
  ): Iterable<U>;

  export function takeWhile<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, [index: number]>,
  ): Iterable<T>;

  export function* takeWhile<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, [index: number]>,
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
    predicate: Predicate<T, [index: number]>,
  ): Iterable<T> {
    return takeWhile(iterable, not(predicate));
  }

  export function* takeLast<T>(
    iterable: Iterable<T>,
    count: number = 1,
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

  export function takeLastWhile<T, U extends T>(
    iterable: Iterable<T>,
    refinement: Refinement<T, U, [index: number]>,
  ): Iterable<U>;

  export function takeLastWhile<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, [index: number]>,
  ): Iterable<T>;

  export function* takeLastWhile<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, [index: number]>,
  ): Iterable<T> {
    const values = [...iterable];

    let last = values.length - 1;

    while (last >= 0) {
      if (predicate(values[last], last)) {
        last--;
      } else {
        break;
      }
    }

    for (let i = last, n = values.length - 1; i < n; i++) {
      yield values[i];
    }
  }

  export function takeLastUntil<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, [index: number]>,
  ): Iterable<T> {
    return takeLastWhile(iterable, not(predicate));
  }

  export function* skip<T>(iterable: Iterable<T>, count: number): Iterable<T> {
    const it = iterator(iterable);

    while (count-- > 0) {
      const next = it.next();

      if (next.done === true) {
        return;
      }
    }

    while (true) {
      const next = it.next();

      if (next.done === true) {
        return;
      }

      yield next.value;
    }
  }

  export function* skipWhile<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, [index: number]>,
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
    predicate: Predicate<T, [index: number]>,
  ): Iterable<T> {
    return skipWhile(iterable, not(predicate));
  }

  export function* skipLast<T>(
    iterable: Iterable<T>,
    count: number = 1,
  ): Iterable<T> {
    const it = iterator(iterable);

    const first: Array<T> = [];

    while (count-- > 0) {
      const next = it.next();

      if (next.done === true) {
        return;
      }

      first.push(next.value);
    }

    while (true) {
      const next = it.next();

      if (next.done === true) {
        return;
      }

      first.push(next.value);

      yield first.shift()!;
    }
  }

  export function* skipLastWhile<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, [index: number]>,
  ): Iterable<T> {
    const values = [...iterable];

    let last = values.length - 1;

    while (last >= 0) {
      if (predicate(values[last], last)) {
        last--;
      } else {
        break;
      }
    }

    for (let i = 0, n = last; i < n; i++) {
      yield values[i];
    }
  }

  export function skipLastUntil<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, [index: number]>,
  ): Iterable<T> {
    return skipLastWhile(iterable, not(predicate));
  }

  export function trim<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, [index: number]>,
  ): Iterable<T> {
    return trimTrailing(trimLeading(iterable, predicate), predicate);
  }

  export function trimLeading<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, [index: number]>,
  ): Iterable<T> {
    return skipWhile(iterable, predicate);
  }

  export function trimTrailing<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, [index: number]>,
  ): Iterable<T> {
    return skipLastWhile(iterable, predicate);
  }

  export function rest<T>(iterable: Iterable<T>): Iterable<T> {
    return skip(iterable, 1);
  }

  export function slice<T>(
    iterable: Iterable<T>,
    start: number,
    end?: number,
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
    const it = iterator(iterable);

    let next = it.next();

    if (next.done === true) {
      return "";
    }

    let result = `${next.value}`;
    next = it.next();

    while (next.done !== true) {
      result += `${separator}${next.value}`;
      next = it.next();
    }

    return result;
  }

  export function sort<T extends Comparable<T>>(
    iterable: Iterable<T>,
  ): Iterable<T> {
    return sortWith(iterable, compareComparable);
  }

  export function sortWith<T>(
    iterable: Iterable<T>,
    comparer: Comparer<T>,
  ): Iterable<T>;

  export function sortWith<T, U extends T = T>(
    iterable: Iterable<U>,
    comparer: Comparer<T>,
  ): Iterable<U>;

  export function* sortWith<T>(
    iterable: Iterable<T>,
    comparer: Comparer<T>,
  ): Iterable<T> {
    yield* [...iterable].sort(comparer);
  }

  export function compare<T extends Comparable<U>, U = T>(
    a: Iterable<T>,
    b: Iterable<U>,
  ): Comparison {
    return compareWith(a, b, compareComparable);
  }

  export function compareWith<T, U = T>(
    a: Iterable<T>,
    b: Iterable<U>,
    comparer: Comparer<T, U, [index: number]>,
  ): Comparison {
    const itA = iterator(a);
    const itB = iterator(b);

    let index = 0;

    while (true) {
      const a = itA.next();
      const b = itB.next();

      if (a.done === true) {
        return b.done === true ? Comparison.Equal : Comparison.Less;
      }

      if (b.done === true) {
        return Comparison.Greater;
      }

      const result = comparer(a.value, b.value, index++);

      if (result !== 0) {
        return result;
      }
    }
  }

  export function equals<T>(a: Iterable<T>, b: Iterable<T>): boolean {
    const itA = iterator(a);
    const itB = iterator(b);

    while (true) {
      const a = itA.next();
      const b = itB.next();

      if (a.done === true) {
        return b.done === true;
      }

      if (b.done === true || !Equatable.equals(a.value, b.value)) {
        return false;
      }
    }
  }

  export function hash<T>(iterable: Iterable<T>, hash: Hash): void {
    let size = 0;

    for (const value of iterable) {
      hash.writeUnknown(value);
      size++;
    }

    hash.writeUint32(size);
  }

  export function iterator<T>(iterable: Iterable<T>): Iterator<T> {
    return iterable[Symbol.iterator]();
  }

  export function groupBy<T, K>(
    iterable: Iterable<T>,
    grouper: Mapper<T, K, [index: number]>,
  ): Iterable<[K, Iterable<T>]> {
    const groups: Array<[K, Array<T>]> = [];

    let index = 0;

    for (const value of iterable) {
      const group = grouper(value, index++);

      const existing = groups.find(([existing]) =>
        Equatable.equals(group, existing),
      );

      if (existing === undefined) {
        groups.push([group, [value]]);
      } else {
        existing[1].push(value);
      }
    }

    return groups;
  }

  export function toJSON<T>(
    iterable: Iterable<T>,
    options?: Serializable.Options,
  ): Array<Serializable.ToJSON<T>> {
    return [...map(iterable, (value) => Serializable.toJSON(value, options))];
  }
}
