import { Array } from "@siteimprove/alfa-array";
import { Callback } from "@siteimprove/alfa-callback";
import type { Collection } from "@siteimprove/alfa-collection";
import {
  Comparable,
  type Comparer,
  Comparison,
} from "@siteimprove/alfa-comparable";
import { Serializable } from "@siteimprove/alfa-json";
import { Lazy } from "@siteimprove/alfa-lazy";
import { Map } from "@siteimprove/alfa-map";
import type { Mapper } from "@siteimprove/alfa-mapper";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";
import { Refinement } from "@siteimprove/alfa-refinement";

import { Cons } from "./cons.js";
import { Nil } from "./nil.js";

/**
 * @public
 */
export interface Sequence<
  T,
  O extends Serializable.Options = Serializable.Options,
> extends Collection.Indexed<T, O> {
  isEmpty(): this is Sequence<never>;
  forEach(callback: Callback<T, void, [index: number]>): void;
  map<U>(mapper: Mapper<T, U, [index: number]>): Sequence<U>;
  apply<U>(mapper: Sequence<Mapper<T, U>>): Sequence<U>;
  flatMap<U>(mapper: Mapper<T, Sequence<U>, [index: number]>): Sequence<U>;
  flatten<T>(this: Sequence<Sequence<T>>): Sequence<T>;
  reduce<U>(reducer: Reducer<T, U, [index: number]>, accumulator: U): U;
  reduceWhile<U>(
    predicate: Predicate<T, [index: number]>,
    reducer: Reducer<T, U, [index: number]>,
    accumulator: U,
  ): U;
  reduceUntil<U>(
    predicate: Predicate<T, [index: number]>,
    reducer: Reducer<T, U, [index: number]>,
    accumulator: U,
  ): U;
  filter<U extends T>(
    refinement: Refinement<T, U, [index: number]>,
  ): Sequence<U>;
  filter(predicate: Predicate<T, [index: number]>): Sequence<T>;
  reject<U extends T>(
    refinement: Refinement<T, U, [index: number]>,
  ): Sequence<Exclude<T, U>>;
  reject(predicate: Predicate<T, [index: number]>): Sequence<T>;
  find<U extends T>(refinement: Refinement<T, U, [index: number]>): Option<U>;
  find(predicate: Predicate<T, [index: number]>): Option<T>;
  includes(value: T): boolean;
  collect<U>(mapper: Mapper<T, Option<U>, [index: number]>): Sequence<U>;
  collectFirst<U>(mapper: Mapper<T, Option<U>, [index: number]>): Option<U>;
  some(predicate: Predicate<T, [index: number]>): boolean;
  none(predicate: Predicate<T, [index: number]>): boolean;
  every(predicate: Predicate<T, [index: number]>): boolean;
  count(predicate: Predicate<T, [index: number]>): number;
  distinct(): Sequence<T>;
  get(index: number): Option<T>;
  has(index: number): boolean;
  set(index: number, value: T): Sequence<T>;
  insert(index: number, value: T): Sequence<T>;
  append(value: T): Sequence<T>;
  prepend(value: T): Sequence<T>;
  concat(iterable: Iterable<T>): Sequence<T>;
  subtract(iterable: Iterable<T>): Sequence<T>;
  intersect(iterable: Iterable<T>): Sequence<T>;
  tee<A extends Array<unknown> = []>(
    callback: Callback<Sequence<T>, void, [...args: A]>,
    ...args: A
  ): Sequence<T>;
  zip<U>(iterable: Iterable<U>): Sequence<[T, U]>;
  first(): Option<T>;
  last(): Option<T>;
  take(count: number): Sequence<T>;
  takeWhile<U extends T>(
    refinement: Refinement<T, U, [index: number]>,
  ): Sequence<U>;
  takeWhile(predicate: Predicate<T, [index: number]>): Sequence<T>;
  takeUntil(predicate: Predicate<T, [index: number]>): Sequence<T>;
  takeLast(count: number): Sequence<T>;
  takeLastWhile<U extends T>(
    refinement: Refinement<T, U, [index: number]>,
  ): Sequence<U>;
  takeLastWhile(predicate: Predicate<T, [index: number]>): Sequence<T>;
  takeLastUntil(predicate: Predicate<T, [index: number]>): Sequence<T>;
  skip(count: number): Sequence<T>;
  skipWhile(predicate: Predicate<T, [index: number]>): Sequence<T>;
  skipUntil(predicate: Predicate<T, [index: number]>): Sequence<T>;
  skipLast(count: number): Sequence<T>;
  skipLastWhile(predicate: Predicate<T, [index: number]>): Sequence<T>;
  skipLastUntil(predicate: Predicate<T, [index: number]>): Sequence<T>;
  trim(predicate: Predicate<T, [index: number]>): Sequence<T>;
  trimLeading(predicate: Predicate<T, [index: number]>): Sequence<T>;
  trimTrailing(predicate: Predicate<T, [index: number]>): Sequence<T>;
  rest(): Sequence<T>;
  slice(start: number, end?: number): Sequence<T>;
  reverse(): Sequence<T>;
  join(separator: string): string;
  sort<T extends Comparable<T>>(this: Sequence<T>): Sequence<T>;
  sortWith(comparer: Comparer<T>): Sequence<T>;
  sortWith<T, U extends T = T>(
    this: Sequence<U>,
    comparer: Comparer<T>,
  ): Sequence<U>;
  compare<T>(this: Sequence<Comparable<T>>, iterable: Iterable<T>): Comparison;
  compareWith<U = T>(
    iterable: Iterable<U>,
    comparer: Comparer<T, U, [index: number]>,
  ): Comparison;
  groupBy<K>(grouper: Mapper<T, K, [index: number]>): Map<K, Sequence<T>>;
  toArray(): Array<T>;
  toJSON(options?: O): Sequence.JSON<T>;
}

/**
 * @public
 */
export namespace Sequence {
  export type JSON<T> = Cons.JSON<T> | Nil.JSON;

  export function isSequence<T>(value: Iterable<T>): value is Sequence<T>;

  export function isSequence<T>(value: unknown): value is Sequence<T>;

  export function isSequence<T>(value: unknown): value is Sequence<T> {
    return isCons(value) || isNil(value);
  }

  export function isCons<T>(value: Iterable<T>): value is Cons<T>;

  export function isCons<T>(value: unknown): value is Cons<T>;

  export function isCons<T>(value: unknown): value is Cons<T> {
    return Cons.isCons(value);
  }

  export function isNil<T>(value: Iterable<T>): value is Nil;

  export function isNil(value: unknown): value is Nil;

  export function isNil(value: unknown): value is Nil {
    return value === Nil;
  }

  export function of<T>(head: T, tail?: Lazy<Sequence<T>>): Sequence<T> {
    return Cons.of(head, tail);
  }

  export function empty<T = never>(): Sequence<T> {
    return Nil;
  }

  export function from<T>(iterable: Iterable<T>): Sequence<T> {
    if (isSequence(iterable)) {
      return iterable;
    }

    if (Array.isArray(iterable)) {
      return fromArray(iterable);
    }

    return fromIterable(iterable);
  }

  export function fromArray<T>(array: ReadonlyArray<T>): Sequence<T> {
    let i = 0;

    const tail = (): Sequence<T> => {
      if (i >= array.length) {
        return empty();
      }

      return of(array[i++], Lazy.of(tail));
    };

    return tail();
  }

  export function fromIterable<T>(iterable: Iterable<T>): Sequence<T> {
    return fromIterator(iterable[Symbol.iterator]());
  }

  export function fromIterator<T>(iterator: Iterator<T>): Sequence<T> {
    const tail = (): Sequence<T> => {
      const head = iterator.next();

      if (head.done === true) {
        return empty();
      }

      return of(head.value, Lazy.of(tail));
    };

    return tail();
  }
}
