import { Applicative } from "@siteimprove/alfa-applicative";
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

export interface Collection<T>
  extends Functor<T>,
    Monad<T>,
    Foldable<T>,
    Applicative<T>,
    Equatable,
    Hashable,
    Serializable {
  readonly size: number;
  isEmpty(): this is Collection<never>;
  map<U>(mapper: Mapper<T, U>): Collection<U>;
  flatMap<U>(mapper: Mapper<T, Collection<U>>): Collection<U>;
  reduce<U>(reducer: Reducer<T, U>, accumulator: U): U;
  apply<U>(mapper: Collection<Mapper<T, U>>): Collection<U>;
  filter<U extends T>(predicate: Predicate<T, U>): Collection<U>;
  reject(predicate: Predicate<T>): Collection<T>;
  find<U extends T>(predicate: Predicate<T, U>): Option<U>;
  includes(value: T): boolean;
  collect<U>(mapper: Mapper<T, Option<U>>): Collection<U>;
  collectFirst<U>(mapper: Mapper<T, Option<U>>): Option<U>;
  some(predicate: Predicate<T>): boolean;
  every(predicate: Predicate<T>): boolean;
  count(predicate: Predicate<T>): number;
  distinct(): Collection<T>;
}

export namespace Collection {
  export interface Keyed<K, V> extends Collection<V>, Iterable<[K, V]> {
    // Collection<T> methods

    isEmpty(): this is Keyed<K, never>;
    map<U>(mapper: Mapper<V, U, [K]>): Keyed<K, U>;
    flatMap<U>(mapper: Mapper<V, Keyed<K, U>, [K]>): Keyed<K, U>;
    reduce<U>(reducer: Reducer<V, U, [K]>, accumulator: U): U;
    apply<U>(mapper: Keyed<K, Mapper<V, U>>): Keyed<K, U>;
    filter<U extends V>(predicate: Predicate<V, U, [K]>): Keyed<K, U>;
    reject(predicate: Predicate<V, V, [K]>): Keyed<K, V>;
    find<U extends V>(predicate: Predicate<V, U, [K]>): Option<U>;
    includes(value: V): boolean;
    collect<U>(mapper: Mapper<V, Option<U>, [K]>): Keyed<K, U>;
    collectFirst<U>(mapper: Mapper<V, Option<U>, [K]>): Option<U>;
    some(predicate: Predicate<V, V, [K]>): boolean;
    every(predicate: Predicate<V, V, [K]>): boolean;
    count(predicate: Predicate<V, V, [K]>): number;
    distinct(): Keyed<K, V>;

    // Keyed<K, V> methods

    get(key: K): Option<V>;
    has(key: K): boolean;
    set(key: K, value: V): Keyed<K, V>;
    delete(key: K, value: V): Keyed<K, V>;
    concat(iterable: Iterable<readonly [K, V]>): Keyed<K, V>;
  }

  export interface Unkeyed<T> extends Collection<T>, Iterable<T> {
    // Collection<T> methods

    isEmpty(): this is Unkeyed<never>;
    map<U>(mapper: Mapper<T, U>): Unkeyed<U>;
    flatMap<U>(mapper: Mapper<T, Unkeyed<U>>): Unkeyed<U>;
    reduce<U>(reducer: Reducer<T, U>, accumulator: U): U;
    apply<U>(mapper: Unkeyed<Mapper<T, U>>): Unkeyed<U>;
    filter<U extends T>(predicate: Predicate<T, U>): Unkeyed<U>;
    reject(predicate: Predicate<T>): Unkeyed<T>;
    find<U extends T>(predicate: Predicate<T, U>): Option<U>;
    includes(value: T): boolean;
    collect<U>(mapper: Mapper<T, Option<U>>): Unkeyed<U>;
    collectFirst<U>(mapper: Mapper<T, Option<U>>): Option<U>;
    some(predicate: Predicate<T>): boolean;
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

  export interface Indexed<T> extends Collection<T>, Iterable<T> {
    // Collection<T> methods

    isEmpty(): this is Indexed<never>;
    map<U>(mapper: Mapper<T, U, [number]>): Indexed<U>;
    flatMap<U>(mapper: Mapper<T, Indexed<U>, [number]>): Indexed<U>;
    reduce<U>(reducer: Reducer<T, U, [number]>, accumulator: U): U;
    apply<U>(mapper: Indexed<Mapper<T, U>>): Indexed<U>;
    filter<U extends T>(predicate: Predicate<T, U, [number]>): Indexed<U>;
    reject(predicate: Predicate<T, T, [number]>): Indexed<T>;
    find<U extends T>(predicate: Predicate<T, U, [number]>): Option<U>;
    includes(value: T): boolean;
    collect<U>(mapper: Mapper<T, Option<U>, [number]>): Indexed<U>;
    collectFirst<U>(mapper: Mapper<T, Option<U>, [number]>): Option<U>;
    some(predicate: Predicate<T, T, [number]>): boolean;
    every(predicate: Predicate<T, T, [number]>): boolean;
    count(predicate: Predicate<T, T, [number]>): number;
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
    takeWhile(predicate: Predicate<T, T, [number]>): Indexed<T>;
    takeUntil(predicate: Predicate<T, T, [number]>): Indexed<T>;
    takeLast(count: number): Indexed<T>;
    skip(count: number): Indexed<T>;
    skipWhile(predicate: Predicate<T, T, [number]>): Indexed<T>;
    skipUntil(predicate: Predicate<T, T, [number]>): Indexed<T>;
    skipLast(count: number): Indexed<T>;
    rest(): Indexed<T>;
    slice(start: number, end?: number): Indexed<T>;
    reverse(): Indexed<T>;
    join(separator: string): string;
  }
}
