import { Callback } from "@siteimprove/alfa-callback";
import { Clone } from "@siteimprove/alfa-clone";
import { Comparable, Comparer, Comparison } from "@siteimprove/alfa-comparable";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";
import { Refinement } from "@siteimprove/alfa-refinement";

import * as builtin from "./builtin";

const { not } = Predicate;
const { compareComparable } = Comparable;

/**
 * @remarks
 * This is a re-export of the global `Array` interface to ensure that it merges
 * with the `Array` namespace.
 *
 * @public
 */
export type Array<T> = globalThis.Array<T>;

/**
 * @public
 */
export namespace Array {
  export function isArray<T>(value: Iterable<T>): value is Array<T>;

  export function isArray<T>(value: unknown): value is Array<T>;

  export function isArray<T>(value: unknown): value is Array<T> {
    return builtin.Array.isArray(value);
  }

  export function of<T>(...values: Array<T>): Array<T> {
    return values;
  }

  export function empty<T = never>(): Array<T> {
    return [];
  }

  export function allocate<T>(capacity: number): Array<T> {
    return new builtin.Array<T>(capacity);
  }

  /**
   * @remarks
   * Unlike the built-in function of the same name, this function will pass
   * along existing arrays as-is instead of returning a copy.
   */
  export function from<T>(iterable: Iterable<T>): Array<T> {
    if (isArray(iterable)) {
      return iterable;
    }

    return [...iterable];
  }

  export function size<T>(array: ReadonlyArray<T>): number {
    return array.length;
  }

  export function isEmpty<T>(array: ReadonlyArray<T>): array is Array<never> {
    return array.length === 0;
  }

  export function copy<T>(array: ReadonlyArray<T>): Array<T> {
    return array.slice(0);
  }

  export function clone<T extends Clone<T>>(array: ReadonlyArray<T>): Array<T> {
    return array.map(Clone.clone);
  }

  export function forEach<T>(
    array: ReadonlyArray<T>,
    callback: Callback<T, void, [index: number]>
  ): void {
    for (let i = 0, n = array.length; i < n; i++) {
      callback(array[i], i);
    }
  }

  export function map<T, U = T>(
    array: ReadonlyArray<T>,
    mapper: Mapper<T, U, [index: number]>
  ): Array<U> {
    const result = new builtin.Array<U>(array.length);

    for (let i = 0, n = array.length; i < n; i++) {
      result[i] = mapper(array[i], i);
    }

    return result;
  }

  export function flatMap<T, U = T>(
    array: ReadonlyArray<T>,
    mapper: Mapper<T, ReadonlyArray<U>, [index: number]>
  ): Array<U> {
    const result = empty<U>();

    for (let i = 0, n = array.length; i < n; i++) {
      result.push(...mapper(array[i], i));
    }

    return result;
  }

  export function flatten<T>(array: ReadonlyArray<ReadonlyArray<T>>): Array<T> {
    return flatMap(array, (array) => array);
  }

  export function reduce<T, U = T>(
    array: ReadonlyArray<T>,
    reducer: Reducer<T, U, [index: number]>,
    accumulator: U
  ): U {
    for (let i = 0, n = array.length; i < n; i++) {
      accumulator = reducer(accumulator, array[i], i);
    }

    return accumulator;
  }

  export function reduceWhile<T, U = T>(
    array: ReadonlyArray<T>,
    predicate: Predicate<T, [index: number]>,
    reducer: Reducer<T, U, [index: number]>,
    accumulator: U
  ): U {
    for (let i = 0, n = array.length; i < n; i++) {
      const value = array[i];

      if (predicate(value, i)) {
        accumulator = reducer(accumulator, value, i);
      } else {
        break;
      }
    }

    return accumulator;
  }

  export function reduceUntil<T, U = T>(
    array: ReadonlyArray<T>,
    predicate: Predicate<T, [index: number]>,
    reducer: Reducer<T, U, [index: number]>,
    accumulator: U
  ): U {
    return reduceWhile(array, not(predicate), reducer, accumulator);
  }

  export function apply<T, U>(
    iterable: ReadonlyArray<T>,
    mapper: ReadonlyArray<Mapper<T, U>>
  ): Array<U> {
    return flatMap(iterable, (value) => map(mapper, (mapper) => mapper(value)));
  }

  export function filter<T, U extends T>(
    array: ReadonlyArray<T>,
    refinement: Refinement<T, U, [index: number]>
  ): Array<U>;

  export function filter<T>(
    array: ReadonlyArray<T>,
    predicate: Predicate<T, [index: number]>
  ): Array<T>;

  export function filter<T>(
    array: ReadonlyArray<T>,
    predicate: Predicate<T, [index: number]>
  ): Array<T> {
    const result = empty<T>();

    for (let i = 0, n = array.length; i < n; i++) {
      const value = array[i];

      if (predicate(value, i)) {
        result.push(value);
      }
    }

    return result;
  }

  export function reject<T, U extends T>(
    array: ReadonlyArray<T>,
    refinement: Refinement<T, U, [index: number]>
  ): Array<Exclude<T, U>>;

  export function reject<T>(
    array: ReadonlyArray<T>,
    predicate: Predicate<T, [index: number]>
  ): Array<T>;

  export function reject<T>(
    array: ReadonlyArray<T>,
    predicate: Predicate<T, [index: number]>
  ): Array<T> {
    return filter(array, not(predicate));
  }

  export function find<T, U extends T>(
    array: ReadonlyArray<T>,
    refinement: Refinement<T, U, [index: number]>
  ): Option<U>;

  export function find<T>(
    array: ReadonlyArray<T>,
    predicate: Predicate<T, [index: number]>
  ): Option<T>;

  export function find<T>(
    array: ReadonlyArray<T>,
    predicate: Predicate<T, [index: number]>
  ): Option<T> {
    for (let i = 0, n = array.length; i < n; i++) {
      const value = array[i];

      if (predicate(value, i)) {
        return Option.of(value);
      }
    }

    return None;
  }

  export function findLast<T, U extends T>(
    array: ReadonlyArray<T>,
    refinement: Refinement<T, U, [index: number]>
  ): Option<U>;

  export function findLast<T>(
    array: ReadonlyArray<T>,
    predicate: Predicate<T, [index: number]>
  ): Option<T>;

  export function findLast<T>(
    array: ReadonlyArray<T>,
    predicate: Predicate<T, [index: number]>
  ): Option<T> {
    for (let i = array.length - 1; i >= 0; i--) {
      const value = array[i];

      if (predicate(value, i)) {
        return Option.of(value);
      }
    }

    return None;
  }

  export function includes<T>(array: ReadonlyArray<T>, value: T): boolean {
    return some(array, Predicate.equals(value));
  }

  export function collect<T, U>(
    array: ReadonlyArray<T>,
    mapper: Mapper<T, Option<U>, [index: number]>
  ): Array<U> {
    const result = empty<U>();

    for (let i = 0, n = array.length; i < n; i++) {
      for (const value of mapper(array[i], i)) {
        result.push(value);
      }
    }

    return result;
  }

  export function collectFirst<T, U>(
    array: ReadonlyArray<T>,
    mapper: Mapper<T, Option<U>, [index: number]>
  ): Option<U> {
    for (let i = 0, n = array.length; i < n; i++) {
      const value = mapper(array[i], i);

      if (value.isSome()) {
        return value;
      }
    }

    return None;
  }

  export function some<T>(
    array: ReadonlyArray<T>,
    predicate: Predicate<T, [index: number]>
  ): boolean {
    for (let i = 0, n = array.length; i < n; i++) {
      if (predicate(array[i], i)) {
        return true;
      }
    }

    return false;
  }

  export function none<T>(
    array: ReadonlyArray<T>,
    predicate: Predicate<T, [index: number]>
  ): boolean {
    return every(array, not(predicate));
  }

  export function every<T>(
    array: ReadonlyArray<T>,
    predicate: Predicate<T, [index: number]>
  ): boolean {
    for (let i = 0, n = array.length; i < n; i++) {
      if (!predicate(array[i], i)) {
        return false;
      }
    }

    return true;
  }

  export function count<T>(
    array: ReadonlyArray<T>,
    predicate: Predicate<T, [index: number]>
  ): number {
    return reduce(
      array,
      (count, value, index) => (predicate(value, index) ? count + 1 : count),
      0
    );
  }

  export function distinct<T>(array: ReadonlyArray<T>): Array<T> {
    const result = empty<T>();

    for (let i = 0, n = array.length; i < n; i++) {
      const value = array[i];

      if (result.some(Predicate.equals(value))) {
        continue;
      }

      result.push(value);
    }

    return result;
  }

  export function get<T>(array: ReadonlyArray<T>, index: number): Option<T> {
    return index < array.length ? Option.of(array[index]) : None;
  }

  export function has<T>(array: ReadonlyArray<T>, index: number): boolean {
    return index < array.length;
  }

  export function set<T>(array: Array<T>, index: number, value: T): Array<T> {
    if (index < array.length) {
      array[index] = value;
    }

    return array;
  }

  export function insert<T>(
    array: Array<T>,
    index: number,
    value: T
  ): Array<T> {
    array.splice(index, 0, value);
    return array;
  }

  export function append<T>(array: Array<T>, value: T): Array<T> {
    array.push(value);
    return array;
  }

  export function prepend<T>(array: Array<T>, value: T): Array<T> {
    array.unshift(value);
    return array;
  }

  export function concat<T>(
    array: ReadonlyArray<T>,
    ...iterables: Array<Iterable<T>>
  ): Array<T> {
    return [...Iterable.concat(array, ...iterables)];
  }

  export function subtract<T>(
    array: ReadonlyArray<T>,
    ...iterables: Array<Iterable<T>>
  ): Array<T> {
    return [...Iterable.subtract(array, ...iterables)];
  }

  export function intersect<T>(
    array: ReadonlyArray<T>,
    ...iterables: Array<Iterable<T>>
  ): Array<T> {
    return [...Iterable.intersect(array, ...iterables)];
  }

  export function zip<T, U = T>(
    array: ReadonlyArray<T>,
    iterable: Iterable<U>
  ): Array<[T, U]> {
    const result = empty<[T, U]>();
    const it = Iterable.iterator(iterable);

    for (let i = 0, n = array.length; i < n; i++) {
      const next = it.next();

      if (next.done === true) {
        break;
      }

      result.push([array[i], next.value]);
    }

    return result;
  }

  export function first<T>(array: ReadonlyArray<T>): Option<T> {
    return array.length > 0 ? Option.of(array[0]) : None;
  }

  export function last<T>(array: ReadonlyArray<T>): Option<T> {
    return array.length > 0 ? Option.of(array[array.length - 1]) : None;
  }

  export function sort<T extends Comparable<T>>(array: Array<T>): Array<T> {
    return sortWith(array, compareComparable);
  }

  export function sortWith<T>(
    array: Array<T>,
    comparer: Comparer<T>
  ): Array<T> {
    return array.sort(comparer);
  }

  export function compare<T extends Comparable<T>>(
    a: ReadonlyArray<T>,
    b: Iterable<T>
  ): Comparison {
    return compareWith(a, b, compareComparable);
  }

  export function compareWith<T>(
    a: ReadonlyArray<T>,
    b: Iterable<T>,
    comparer: Comparer<T>
  ): Comparison {
    return Iterable.compareWith(a, b, comparer);
  }

  export function search<T>(
    array: ReadonlyArray<T>,
    value: T,
    comparer: Comparer<T>
  ): number {
    let lower = 0;
    let upper = array.length - 1;

    while (lower <= upper) {
      const middle = (lower + (upper - lower) / 2) >>> 0;

      switch (comparer(value, array[middle]!)) {
        case Comparison.Greater:
          lower = middle + 1;
          break;
        case Comparison.Less:
          upper = middle - 1;
          break;
        case Comparison.Equal:
          return middle;
      }
    }

    return lower;
  }

  export function equals<T>(a: ReadonlyArray<T>, b: ReadonlyArray<T>): boolean {
    if (a.length !== b.length) {
      return false;
    }

    for (let i = 0, n = a.length; i < n; i++) {
      if (!Equatable.equals(a[i], b[i])) {
        return false;
      }
    }

    return true;
  }

  export function hash<T>(array: ReadonlyArray<T>, hash: Hash): void {
    for (let i = 0, n = array.length; i < n; i++) {
      hash.writeUnknown(array[i]);
    }

    hash.writeUint32(array.length);
  }

  export function iterator<T>(array: ReadonlyArray<T>): Iterator<T> {
    return array[Symbol.iterator]();
  }

  export function toJSON<T>(
    array: ReadonlyArray<T>
  ): Array<Serializable.ToJSON<T>> {
    return array.map((value) => Serializable.toJSON(value));
  }
}
