import { Clone } from "@siteimprove/alfa-clone";
import { Comparable, Comparer, Comparison } from "@siteimprove/alfa-comparable";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";
import { Refinement } from "@siteimprove/alfa-refinement";

import * as global from "./global";

const { compareComparable } = Comparable;

// Re-export the global `Array` interface to ensure that it merges with the
// `Array` namespace.
export type Array<T> = globalThis.Array<T>;

export namespace Array {
  export function isArray<T>(value: Iterable<T>): value is Array<T>;

  export function isArray<T>(value: unknown): value is Array<T>;

  export function isArray<T>(value: unknown): value is Array<T> {
    return global.isArray(value);
  }

  export function of<T>(...values: Array<T>): Array<T> {
    return values;
  }

  export function empty<T = never>(): Array<T> {
    return [];
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

  export function size<T>(array: Array<T>): number {
    return array.length;
  }

  export function isEmpty<T>(array: Array<T>): array is Array<never> {
    return array.length === 0;
  }

  export function copy<T>(array: Array<T>): Array<T> {
    return array.slice(0);
  }

  export function clone<T extends Clone<T>>(array: Array<T>): Array<T> {
    return array.map(Clone.clone);
  }

  export function reduce<T, U = T>(
    array: Array<T>,
    reducer: Reducer<T, U, [number]>,
    accumulator: U
  ): U {
    for (let i = 0, n = array.length; i < n; i++) {
      accumulator = reducer(accumulator, array[i], i);
    }

    return accumulator;
  }

  export function find<T, U extends T>(
    array: Array<T>,
    refinement: Refinement<T, U, [number]>
  ): Option<U>;

  export function find<T>(
    array: Array<T>,
    predicate: Predicate<T, [number]>
  ): Option<T>;

  export function find<T>(
    array: Array<T>,
    predicate: Predicate<T, [number]>
  ): Option<T> {
    for (let i = 0, n = array.length; i < n; i++) {
      const value = array[i];

      if (predicate(value, i)) {
        return Some.of(value);
      }
    }

    return None;
  }

  export function findLast<T, U extends T>(
    array: Array<T>,
    refinement: Refinement<T, U, [number]>
  ): Option<U>;

  export function findLast<T>(
    array: Array<T>,
    predicate: Predicate<T, [number]>
  ): Option<T>;

  export function findLast<T>(
    array: Array<T>,
    predicate: Predicate<T, [number]>
  ): Option<T> {
    for (let i = array.length - 1; i >= 0; i--) {
      const value = array[i];

      if (predicate(value, i)) {
        return Some.of(value);
      }
    }

    return None;
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
    a: Array<T>,
    b: Iterable<T>
  ): Comparison {
    return compareWith(a, b, compareComparable);
  }

  export function compareWith<T>(
    a: Array<T>,
    b: Iterable<T>,
    comparer: Comparer<T>
  ): Comparison {
    return Iterable.compareWith(a, b, comparer);
  }

  export function search<T>(
    array: Array<T>,
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

  export function equals<T>(a: Array<T>, b: Array<T>): boolean {
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

  export function hash<T>(array: Array<T>, hash: Hash): void {
    for (let i = 0, n = array.length; i < n; i++) {
      Hashable.hash(hash, array[i]);
    }

    Hash.writeUint32(hash, array.length);
  }

  export function toJSON<T>(array: Array<T>): Array<Serializable.ToJSON<T>> {
    return array.map((value) => Serializable.toJSON(value));
  }
}
