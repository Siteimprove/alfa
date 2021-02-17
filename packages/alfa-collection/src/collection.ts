import { Applicative } from "@siteimprove/alfa-applicative";
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

const { compareComparable } = Comparable;

export interface Collection<T>
  extends Functor<T>,
    Monad<T>,
    Foldable<T>,
    Applicative<T>,
    Equatable,
    Hashable {
  readonly size: number;
  isEmpty(): this is Collection<never>;
  forEach(callback: Callback<T>): void;
  map<U>(mapper: Mapper<T, U>): Collection<U>;
  flatMap<U>(mapper: Mapper<T, Collection<U>>): Collection<U>;
  reduce<U>(reducer: Reducer<T, U>, accumulator: U): U;
  apply<U>(mapper: Collection<Mapper<T, U>>): Collection<U>;
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
}

export namespace Collection {
  export interface Keyed<K, V>
    extends Collection<V>,
      Iterable<[K, V]>,
      Serializable<Keyed.JSON<K, V>> {
    // Collection<T> methods

    isEmpty(): this is Keyed<K, never>;
    forEach(callback: Callback<V, void, [key: K]>): void;
    map<U>(mapper: Mapper<V, U, [key: K]>): Keyed<K, U>;
    flatMap<U>(mapper: Mapper<V, Keyed<K, U>, [key: K]>): Keyed<K, U>;
    reduce<U>(reducer: Reducer<V, U, [key: K]>, accumulator: U): U;
    apply<U>(mapper: Keyed<K, Mapper<V, U>>): Keyed<K, U>;
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

    // Keyed<K, V> methods

    get(key: K): Option<V>;
    has(key: K): boolean;
    set(key: K, value: V): Keyed<K, V>;
    delete(key: K, value: V): Keyed<K, V>;
    concat(iterable: Iterable<readonly [K, V]>): Keyed<K, V>;
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
    // Collection<T> methods

    isEmpty(): this is Unkeyed<never>;
    forEach(callback: Callback<T>): void;
    map<U>(mapper: Mapper<T, U>): Unkeyed<U>;
    flatMap<U>(mapper: Mapper<T, Unkeyed<U>>): Unkeyed<U>;
    reduce<U>(reducer: Reducer<T, U>, accumulator: U): U;
    apply<U>(mapper: Unkeyed<Mapper<T, U>>): Unkeyed<U>;
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

    // Unkeyed<T> methods

    get(value: T): Option<T>;
    has(value: T): boolean;
    add(value: T): Unkeyed<T>;
    delete(value: T): Unkeyed<T>;
    concat(iterable: Iterable<T>): Unkeyed<T>;
  }

  export namespace Unkeyed {
    export type JSON<T> = Array<Serializable.ToJSON<T>>;
  }

  export interface Indexed<T>
    extends Collection<T>,
      Iterable<T>,
      Serializable<Indexed.JSON<T>> {
    // Collection<T> methods

    isEmpty(): this is Indexed<never>;
    forEach(callback: Callback<T, void, [index: number]>): void;
    map<U>(mapper: Mapper<T, U, [index: number]>): Indexed<U>;
    flatMap<U>(mapper: Mapper<T, Indexed<U>, [index: number]>): Indexed<U>;
    reduce<U>(reducer: Reducer<T, U, [index: number]>, accumulator: U): U;
    apply<U>(mapper: Indexed<Mapper<T, U>>): Indexed<U>;
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

    // Indexed<T> methods

    get(index: number): Option<T>;
    has(index: number): boolean;
    set(index: number, value: T): Indexed<T>;
    insert(index: number, value: T): Indexed<T>;
    append(value: T): Indexed<T>;
    prepend(value: T): Indexed<T>;
    concat(iterable: Iterable<T>): Indexed<T>;
    first(): Option<T>;
    last(): Option<T>;
    take(count: number): Indexed<T>;
    takeWhile(predicate: Predicate<T, [index: number]>): Indexed<T>;
    takeUntil(predicate: Predicate<T, [index: number]>): Indexed<T>;
    takeLast(count: number): Indexed<T>;
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
    sortWith(comparer: Comparer<T>): Indexed<T>;
    compareWith(iterable: Iterable<T>, comparer: Comparer<T>): Comparison;
  }

  export namespace Indexed {
    export type JSON<T> = Array<Serializable.ToJSON<T>>;
  }

  export function sort<T extends Comparable<T>>(
    collection: Indexed<T>
  ): Indexed<T> {
    return collection.sortWith(compareComparable);
  }

  export function compare<T extends Comparable<T>>(
    a: Indexed<T>,
    b: Iterable<T>
  ): Comparison {
    return a.compareWith(b, compareComparable);
  }
}
