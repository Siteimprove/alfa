import { Equatable } from "@siteimprove/alfa-equatable";
import { Foldable } from "@siteimprove/alfa-foldable";
import { Functor } from "@siteimprove/alfa-functor";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Monad } from "@siteimprove/alfa-monad";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";

export interface Collection<T>
  extends Functor<T>,
    Monad<T>,
    Foldable<T>,
    Equatable,
    Serializable {
  readonly size: number;
  isEmpty(): this is Collection<never>;
  map<U>(mapper: Mapper<T, U>): Collection<U>;
  flatMap<U>(mapper: Mapper<T, Collection<U>>): Collection<U>;
  reduce<U>(reducer: Reducer<T, U>, accumulator: U): U;
  filter<U extends T>(predicate: Predicate<T, U>): Collection<U>;
  find<U extends T>(predicate: Predicate<T, U>): Option<U>;
  includes(value: T): boolean;
  some(predicate: Predicate<T>): boolean;
  every(predicate: Predicate<T>): boolean;
  count(predicate: Predicate<T>): number;
}

export namespace Collection {
  export interface Keyed<K, V> extends Collection<V>, Iterable<[K, V]> {
    isEmpty(): this is Keyed<K, never>;
    map<U>(mapper: Mapper<V, U, [K]>): Keyed<K, U>;
    flatMap<U>(mapper: Mapper<V, Keyed<K, U>, [K]>): Keyed<K, U>;
    reduce<U>(reducer: Reducer<V, U, [K]>, accumulator: U): U;
    filter<U extends V>(predicate: Predicate<V, U, [K]>): Keyed<K, U>;
    find<U extends V>(predicate: Predicate<V, U, [K]>): Option<U>;
    includes(value: V): boolean;
    some(predicate: Predicate<V, V, [K]>): boolean;
    every(predicate: Predicate<V, V, [K]>): boolean;
    count(predicate: Predicate<V, V, [K]>): number;

    // Keyed<K, V> specific methods

    get(key: K): Option<V>;
    has(key: K): boolean;
    concat(iterable: Iterable<[K, V]>): Keyed<K, V>;
  }

  export interface Unkeyed<T> extends Collection<T>, Iterable<T> {
    isEmpty(): this is Unkeyed<never>;
    map<U>(mapper: Mapper<T, U>): Unkeyed<U>;
    flatMap<U>(mapper: Mapper<T, Unkeyed<U>>): Unkeyed<U>;
    reduce<U>(reducer: Reducer<T, U>, accumulator: U): U;
    filter<U extends T>(predicate: Predicate<T, U>): Unkeyed<U>;
    find<U extends T>(predicate: Predicate<T, U>): Option<U>;
    includes(value: T): boolean;
    some(predicate: Predicate<T>): boolean;
    every(predicate: Predicate<T>): boolean;
    count(predicate: Predicate<T>): number;

    // Unkeyed<T> specific methods

    get(value: T): Option<T>;
    has(value: T): boolean;
    concat(iterable: Iterable<T>): Unkeyed<T>;
  }

  export interface Indexed<T> extends Collection<T>, Iterable<T> {
    isEmpty(): this is Indexed<never>;
    map<U>(mapper: Mapper<T, U, [number]>): Indexed<U>;
    flatMap<U>(mapper: Mapper<T, Indexed<U>, [number]>): Indexed<U>;
    reduce<U>(reducer: Reducer<T, U, [number]>, accumulator: U): U;
    filter<U extends T>(predicate: Predicate<T, U, [number]>): Indexed<U>;
    find<U extends T>(predicate: Predicate<T, U, [number]>): Option<U>;
    includes(value: T): boolean;
    some(predicate: Predicate<T, T, [number]>): boolean;
    every(predicate: Predicate<T, T, [number]>): boolean;
    count(predicate: Predicate<T, T, [number]>): number;

    // Indexed<T> specific methods

    get(index: number): Option<T>;
    has(index: number): boolean;
    concat(iterable: Iterable<T>): Indexed<T>;
    first(): Option<T>;
    last(): Option<T>;
    take(count: number): Indexed<T>;
    takeWhile(predicate: Predicate<T, T, [number]>): Indexed<T>;
    takeUntil(predicate: Predicate<T, T, [number]>): Indexed<T>;
    skip(count: number): Indexed<T>;
    skipWhile(predicate: Predicate<T, T, [number]>): Indexed<T>;
    skipUntil(predicate: Predicate<T, T, [number]>): Indexed<T>;
    rest(): Indexed<T>;
    slice(start: number, end?: number): Indexed<T>;
    reverse(): Indexed<T>;
    join(separator: string): string;
  }
}
