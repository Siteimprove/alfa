import { Applicative } from "@siteimprove/alfa-applicative";
import { Array } from "@siteimprove/alfa-array";
import { Callback } from "@siteimprove/alfa-callback";
import { Comparable, Comparer, Comparison } from "@siteimprove/alfa-comparable";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Foldable } from "@siteimprove/alfa-foldable";
import { Functor } from "@siteimprove/alfa-functor";
import { Hashable } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Monad } from "@siteimprove/alfa-monad";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";
import { Refinement } from "@siteimprove/alfa-refinement";

/**
 * @public
 */
export interface Collection<T>
  extends Functor<T>,
    Applicative<T>,
    Monad<T>,
    Foldable<T>,
    Equatable,
    Hashable {
  readonly size: number;
  isEmpty(): this is Collection<never>;
  forEach(callback: Callback<T>): void;
  map<U>(mapper: Mapper<T, U>): Collection<U>;
  apply<U>(mapper: Collection<Mapper<T, U>>): Collection<U>;
  flatMap<U>(mapper: Mapper<T, Collection<U>>): Collection<U>;
  flatten<T>(this: Collection<Collection<T>>): Collection<T>;
  reduce<U>(reducer: Reducer<T, U>, accumulator: U): U;
  filter<U extends T>(refinement: Refinement<T, U>): Collection<U>;
  filter(predicate: Predicate<T>): Collection<T>;
  reject<U extends T>(refinement: Refinement<T, U>): Collection<Exclude<T, U>>;
  reject(predicate: Predicate<T>): Collection<T>;
  find<U extends T>(refinement: Refinement<T, U>): Option<U>;
  find(predicate: Predicate<T>): Option<T>;
  includes(value: T): boolean;
  collect<U>(mapper: Mapper<T, Option<U>>): Collection<U>;
  collectFirst<U>(mapper: Mapper<T, Option<U>>): Option<U>;
  some(predicate: Predicate<T>): boolean;
  none(predicate: Predicate<T>): boolean;
  every(predicate: Predicate<T>): boolean;
  count(predicate: Predicate<T>): number;
  distinct(): Collection<T>;
  tee<A extends Array<unknown> = []>(
    callback: Callback<Collection<T>, void, [...args: A]>,
    ...args: A
  ): Collection<T>;
}

/**
 * @public
 */
export namespace Collection {
  export interface Keyed<K, V>
    extends Collection<V>,
      Iterable<[K, V]>,
      Serializable<Keyed.JSON<K, V>> {
    isEmpty(): this is Keyed<K, never>;
    forEach(callback: Callback<V, void, [key: K]>): void;
    map<U>(mapper: Mapper<V, U, [key: K]>): Keyed<K, U>;
    apply<U>(mapper: Keyed<K, Mapper<V, U>>): Keyed<K, U>;
    flatMap<U>(mapper: Mapper<V, Keyed<K, U>, [key: K]>): Keyed<K, U>;
    flatten<K, V>(this: Keyed<K, Keyed<K, V>>): Keyed<K, V>;
    reduce<U>(reducer: Reducer<V, U, [key: K]>, accumulator: U): U;
    filter<U extends V>(refinement: Refinement<V, U, [key: K]>): Keyed<K, U>;
    filter(predicate: Predicate<V, [key: K]>): Keyed<K, V>;
    reject<U extends V>(
      refinement: Refinement<V, U, [key: K]>
    ): Keyed<K, Exclude<V, U>>;
    reject(predicate: Predicate<V, [key: K]>): Keyed<K, V>;
    find<U extends V>(refinement: Refinement<V, U, [key: K]>): Option<U>;
    find(predicate: Predicate<V, [key: K]>): Option<V>;
    includes(value: V): boolean;
    collect<U>(mapper: Mapper<V, Option<U>, [key: K]>): Keyed<K, U>;
    collectFirst<U>(mapper: Mapper<V, Option<U>, [key: K]>): Option<U>;
    some(predicate: Predicate<V, [key: K]>): boolean;
    none(predicate: Predicate<V, [key: K]>): boolean;
    every(predicate: Predicate<V, [key: K]>): boolean;
    count(predicate: Predicate<V, [key: K]>): number;
    distinct(): Keyed<K, V>;
    get(key: K): Option<V>;
    has(key: K): boolean;
    set(key: K, value: V): Keyed<K, V>;
    delete(key: K, value: V): Keyed<K, V>;
    concat(iterable: Iterable<readonly [K, V]>): Keyed<K, V>;
    subtract(iterable: Iterable<readonly [K, V]>): Keyed<K, V>;
    intersect(iterable: Iterable<readonly [K, V]>): Keyed<K, V>;
    tee<A extends Array<unknown> = []>(
      callback: Callback<Keyed<K, V>, void, [...args: A]>,
      ...args: A
    ): Keyed<K, V>;
  }

  export namespace Keyed {
    export type JSON<K, V> = Array<
      [Serializable.ToJSON<K>, Serializable.ToJSON<V>]
    >;
  }

  export interface Unkeyed<T>
    extends Collection<T>,
      Iterable<T>,
      Serializable<Unkeyed.JSON<T>> {
    isEmpty(): this is Unkeyed<never>;
    forEach(callback: Callback<T>): void;
    map<U>(mapper: Mapper<T, U>): Unkeyed<U>;
    apply<U>(mapper: Unkeyed<Mapper<T, U>>): Unkeyed<U>;
    flatMap<U>(mapper: Mapper<T, Unkeyed<U>>): Unkeyed<U>;
    flatten<T>(this: Unkeyed<Unkeyed<T>>): Unkeyed<T>;
    reduce<U>(reducer: Reducer<T, U>, accumulator: U): U;
    filter<U extends T>(refinement: Refinement<T, U>): Unkeyed<U>;
    filter(predicate: Predicate<T>): Unkeyed<T>;
    reject<U extends T>(refinement: Refinement<T, U>): Unkeyed<Exclude<T, U>>;
    reject(predicate: Predicate<T>): Unkeyed<T>;
    find<U extends T>(refinement: Refinement<T, U>): Option<U>;
    find(predicate: Predicate<T>): Option<T>;
    includes(value: T): boolean;
    collect<U>(mapper: Mapper<T, Option<U>>): Unkeyed<U>;
    collectFirst<U>(mapper: Mapper<T, Option<U>>): Option<U>;
    some(predicate: Predicate<T>): boolean;
    none(predicate: Predicate<T>): boolean;
    every(predicate: Predicate<T>): boolean;
    count(predicate: Predicate<T>): number;
    distinct(): Unkeyed<T>;
    get(value: T): Option<T>;
    has(value: T): boolean;
    add(value: T): Unkeyed<T>;
    delete(value: T): Unkeyed<T>;
    concat(iterable: Iterable<T>): Unkeyed<T>;
    subtract(iterable: Iterable<T>): Unkeyed<T>;
    intersect(iterable: Iterable<T>): Unkeyed<T>;
    tee<A extends Array<unknown> = []>(
      callback: Callback<Unkeyed<T>, void, [...args: A]>,
      ...args: A
    ): Unkeyed<T>;
  }

  export namespace Unkeyed {
    export type JSON<T> = Array<Serializable.ToJSON<T>>;
  }

  export interface Indexed<T>
    extends Collection<T>,
      Iterable<T>,
      Comparable<Iterable<T>>,
      Serializable<Indexed.JSON<T>> {
    isEmpty(): this is Indexed<never>;
    forEach(callback: Callback<T, void, [index: number]>): void;
    map<U>(mapper: Mapper<T, U, [index: number]>): Indexed<U>;
    apply<U>(mapper: Indexed<Mapper<T, U>>): Indexed<U>;
    flatMap<U>(mapper: Mapper<T, Indexed<U>, [index: number]>): Indexed<U>;
    flatten<T>(this: Indexed<Indexed<T>>): Indexed<T>;
    reduce<U>(reducer: Reducer<T, U, [index: number]>, accumulator: U): U;
    reduceWhile<U>(
      predicate: Predicate<T, [index: number]>,
      reducer: Reducer<T, U, [index: number]>,
      accumulator: U
    ): U;
    reduceUntil<U>(
      predicate: Predicate<T, [index: number]>,
      reducer: Reducer<T, U, [index: number]>,
      accumulator: U
    ): U;
    filter<U extends T>(
      refinement: Refinement<T, U, [index: number]>
    ): Indexed<U>;
    filter(predicate: Predicate<T, [index: number]>): Indexed<T>;
    reject<U extends T>(
      refinement: Refinement<T, U, [index: number]>
    ): Indexed<Exclude<T, U>>;
    reject(predicate: Predicate<T, [index: number]>): Indexed<T>;
    find<U extends T>(refinement: Refinement<T, U, [index: number]>): Option<U>;
    find(predicate: Predicate<T, [index: number]>): Option<T>;
    includes(value: T): boolean;
    collect<U>(mapper: Mapper<T, Option<U>, [index: number]>): Indexed<U>;
    collectFirst<U>(mapper: Mapper<T, Option<U>, [index: number]>): Option<U>;
    some(predicate: Predicate<T, [index: number]>): boolean;
    none(predicate: Predicate<T, [index: number]>): boolean;
    every(predicate: Predicate<T, [index: number]>): boolean;
    count(predicate: Predicate<T, [index: number]>): number;
    distinct(): Indexed<T>;
    get(index: number): Option<T>;
    has(index: number): boolean;
    set(index: number, value: T): Indexed<T>;
    insert(index: number, value: T): Indexed<T>;
    append(value: T): Indexed<T>;
    prepend(value: T): Indexed<T>;
    concat(iterable: Iterable<T>): Indexed<T>;
    subtract(iterable: Iterable<T>): Indexed<T>;
    intersect(iterable: Iterable<T>): Indexed<T>;
    tee<A extends Array<unknown> = []>(
      callback: Callback<Indexed<T>, void, [...args: A]>,
      ...args: A
    ): Indexed<T>;
    zip<U>(iterable: Iterable<U>): Indexed<[T, U]>;
    first(): Option<T>;
    last(): Option<T>;
    take(count: number): Indexed<T>;
    takeWhile<U extends T>(
      refinement: Refinement<T, U, [index: number]>
    ): Indexed<U>;
    takeWhile(predicate: Predicate<T, [index: number]>): Indexed<T>;
    takeUntil(predicate: Predicate<T, [index: number]>): Indexed<T>;
    takeLast(count: number): Indexed<T>;
    takeLastWhile<U extends T>(
      refinement: Refinement<T, U, [index: number]>
    ): Indexed<U>;
    takeLastWhile(predicate: Predicate<T, [index: number]>): Indexed<T>;
    takeLastUntil(predicate: Predicate<T, [index: number]>): Indexed<T>;
    skip(count: number): Indexed<T>;
    skipWhile(predicate: Predicate<T, [index: number]>): Indexed<T>;
    skipUntil(predicate: Predicate<T, [index: number]>): Indexed<T>;
    skipLast(count: number): Indexed<T>;
    skipLastWhile(predicate: Predicate<T, [index: number]>): Indexed<T>;
    skipLastUntil(predicate: Predicate<T, [index: number]>): Indexed<T>;
    trim(predicate: Predicate<T, [index: number]>): Indexed<T>;
    trimLeading(predicate: Predicate<T, [index: number]>): Indexed<T>;
    trimTrailing(predicate: Predicate<T, [index: number]>): Indexed<T>;
    rest(): Indexed<T>;
    slice(start: number, end?: number): Indexed<T>;
    reverse(): Indexed<T>;
    join(separator: string): string;
    sort<T extends Comparable<T>>(this: Indexed<T>): Indexed<T>;
    sortWith(comparer: Comparer<T>): Indexed<T>;
    sortWith<T, U extends T = T>(
      this: Indexed<U>,
      comparer: Comparer<T>
    ): Indexed<U>;
    compare<T>(this: Indexed<Comparable<T>>, iterable: Iterable<T>): Comparison;
    compareWith<U = T>(
      iterable: Iterable<U>,
      comparer: Comparer<T, U, [index: number]>
    ): Comparison;
  }

  export namespace Indexed {
    export type JSON<T> = Array<Serializable.ToJSON<T>>;
  }
}
