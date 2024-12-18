import { Array } from "@siteimprove/alfa-array";
import type { Callback } from "@siteimprove/alfa-callback";
import type { Collection } from "@siteimprove/alfa-collection";
import { FNV } from "@siteimprove/alfa-fnv";
import type { Hash } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import type { Mapper } from "@siteimprove/alfa-mapper";
import type { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import type { Reducer } from "@siteimprove/alfa-reducer";
import type { Refinement } from "@siteimprove/alfa-refinement";

import type { Node } from "./node.js";
import { Empty } from "./node.js";

const { not } = Predicate;

/**
 * @public
 */
export class Map<K, V> implements Collection.Keyed<K, V> {
  public static of<K, V>(...entries: Array<readonly [K, V]>): Map<K, V> {
    return entries.reduce(
      (map, [key, value]) => map.set(key, value),
      Map.empty<K, V>(),
    );
  }

  private static _empty = new Map<never, never>(Empty, 0);

  public static empty<K = never, V = never>(): Map<K, V> {
    return this._empty;
  }

  private readonly _root: Node<K, V>;
  private readonly _size: number;

  protected constructor(root: Node<K, V>, size: number) {
    this._root = root;
    this._size = size;
  }

  public get size(): number {
    return this._size;
  }

  public isEmpty(): this is Map<K, never> {
    return this._size === 0;
  }

  public forEach(callback: Callback<V, void, [key: K]>): void {
    Iterable.forEach(this, ([key, value]) => callback(value, key));
  }

  public map<U>(mapper: Mapper<V, U, [key: K]>): Map<K, U> {
    return new Map(this._root.map(mapper), this._size);
  }

  /**
   * Apply a map of functions to each corresponding value of this map.
   *
   * @remarks
   * Keys without a corresponding function or value are dropped from the
   * resulting map.
   *
   * @example
   * ```ts
   * Map.of(["a", 1], ["b", 2])
   *   .apply(Map.of(["a", (x) => x + 1], ["b", (x) => x * 2]))
   *   .toArray();
   * // => [["a", 2], ["b", 4]]
   * ```
   */
  public apply<U>(mapper: Map<K, Mapper<V, U>>): Map<K, U> {
    return this.collect((value, key) =>
      mapper.get(key).map((mapper) => mapper(value)),
    );
  }

  /**
   * @remarks
   * As the order of maps is undefined, it is also undefined which keys are
   * kept when duplicate keys are encountered.
   */
  public flatMap<L, U>(mapper: Mapper<V, Map<L, U>, [key: K]>): Map<L, U> {
    return this.reduce(
      (map, value, key) => map.concat(mapper(value, key)),
      Map.empty<L, U>(),
    );
  }

  /**
   * @remarks
   * As the order of maps is undefined, it is also undefined which keys are
   * kept when duplicate keys are encountered.
   */
  public flatten<K, V>(this: Map<K, Map<K, V>>): Map<K, V> {
    return this.flatMap((map) => map);
  }

  public reduce<R>(reducer: Reducer<V, R, [key: K]>, accumulator: R): R {
    return Iterable.reduce(
      this,
      (accumulator, [key, value]) => reducer(accumulator, value, key),
      accumulator,
    );
  }

  public filter<U extends V>(refinement: Refinement<V, U, [key: K]>): Map<K, U>;

  public filter(predicate: Predicate<V, [key: K]>): Map<K, V>;

  public filter(predicate: Predicate<V, [key: K]>): Map<K, V> {
    return this.reduce(
      (map, value, key) => (predicate(value, key) ? map.set(key, value) : map),
      Map.empty(),
    );
  }

  public reject<U extends V>(
    refinement: Refinement<V, U, [key: K]>,
  ): Map<K, Exclude<V, U>>;

  public reject(predicate: Predicate<V, [key: K]>): Map<K, V>;

  public reject(predicate: Predicate<V, [key: K]>): Map<K, V> {
    return this.filter(not(predicate));
  }

  public find<U extends V>(refinement: Refinement<V, U, [key: K]>): Option<U>;

  public find(predicate: Predicate<V, [key: K]>): Option<V>;

  public find(predicate: Predicate<V, [key: K]>): Option<V> {
    return Iterable.find(this, ([key, value]) => predicate(value, key)).map(
      ([, value]) => value,
    );
  }

  public includes(value: V): boolean {
    return Iterable.includes(this.values(), value);
  }

  public collect<U>(mapper: Mapper<V, Option<U>, [key: K]>): Map<K, U> {
    return Map.from(
      Iterable.collect(this, ([key, value]) =>
        mapper(value, key).map((value) => [key, value]),
      ),
    );
  }

  public collectFirst<U>(mapper: Mapper<V, Option<U>, [key: K]>): Option<U> {
    return Iterable.collectFirst(this, ([key, value]) => mapper(value, key));
  }

  public some(predicate: Predicate<V, [key: K]>): boolean {
    return Iterable.some(this, ([key, value]) => predicate(value, key));
  }

  public none(predicate: Predicate<V, [key: K]>): boolean {
    return Iterable.none(this, ([key, value]) => predicate(value, key));
  }

  public every(predicate: Predicate<V, [key: K]>): boolean {
    return Iterable.every(this, ([key, value]) => predicate(value, key));
  }

  public count(predicate: Predicate<V, [key: K]>): number {
    return Iterable.count(this, ([key, value]) => predicate(value, key));
  }

  /**
   * @remarks
   * As the order of maps is undefined, it is also undefined which keys are
   * kept when duplicate values are encountered.
   */
  public distinct(): Map<K, V> {
    let seen = Map.empty<V, V>();

    // We optimize for the case where there are more distinct values than there
    // are duplicate values by starting with the current map and removing
    // duplicates as we find them.
    let map: Map<K, V> = this;

    for (const [key, value] of map) {
      if (seen.has(value)) {
        map = map.delete(key);
      } else {
        seen = seen.set(value, value);
      }
    }

    return map;
  }

  public get(key: K): Option<V> {
    return this._root.get(key, hash(key), 0);
  }

  public has(key: K): boolean {
    return this.get(key).isSome();
  }

  public set(key: K, value: V): Map<K, V> {
    const { result: root, status } = this._root.set(key, value, hash(key), 0);

    if (status === "unchanged") {
      return this;
    }

    return new Map(root, this._size + (status === "updated" ? 0 : 1));
  }

  public delete(key: K): Map<K, V> {
    const { result: root, status } = this._root.delete(key, hash(key), 0);

    if (status === "unchanged") {
      return this;
    }

    return new Map(root, this._size - 1);
  }

  public concat(iterable: Iterable<readonly [K, V]>): Map<K, V> {
    return Iterable.reduce<readonly [K, V], Map<K, V>>(
      iterable,
      (map, [key, value]) => map.set(key, value),
      this,
    );
  }

  public subtract(iterable: Iterable<readonly [K, V]>): Map<K, V> {
    return Iterable.reduce<readonly [K, V], Map<K, V>>(
      iterable,
      (map, [key]) => map.delete(key),
      this,
    );
  }

  public intersect(iterable: Iterable<readonly [K, V]>): Map<K, V> {
    return Map.fromIterable(
      Iterable.filter(iterable, ([key]) => this.has(key)),
    );
  }

  public tee<A extends Array<unknown> = []>(
    callback: Callback<this, void, [...args: A]>,
    ...args: A
  ): this {
    callback(this, ...args);
    return this;
  }

  public equals<K, V>(value: Map<K, V>): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Map &&
      value._size === this._size &&
      value._root.equals(this._root)
    );
  }

  public hash(hash: Hash): void {
    for (const [key, value] of this) {
      hash.writeUnknown(key).writeUnknown(value);
    }

    hash.writeUint32(this._size);
  }

  public keys(): Iterable<K> {
    return Iterable.map(this._root, (entry) => entry[0]);
  }

  public values(): Iterable<V> {
    return Iterable.map(this._root, (entry) => entry[1]);
  }

  public *iterator(): Iterator<[K, V]> {
    yield* this._root;
  }

  public [Symbol.iterator](): Iterator<[K, V]> {
    return this.iterator();
  }

  public toArray(): Array<[K, V]> {
    return [...this];
  }

  public toJSON(options?: Serializable.Options): Map.JSON<K, V> {
    return this.toArray().map(([key, value]) => [
      Serializable.toJSON(key, options),
      Serializable.toJSON(value, options),
    ]);
  }

  public toString(): string {
    const entries = this.toArray()
      .map(([key, value]) => `${key} => ${value}`)
      .join(", ");

    return `Map {${entries === "" ? "" : ` ${entries} `}}`;
  }
}

/**
 * @public
 */
export namespace Map {
  export type JSON<K, V> = Collection.Keyed.JSON<K, V>;

  export function isMap<K, V>(
    value: Iterable<readonly [K, V]>,
  ): value is Map<K, V>;

  export function isMap<K, V>(value: unknown): value is Map<K, V>;

  export function isMap<K, V>(value: unknown): value is Map<K, V> {
    return value instanceof Map;
  }

  export function from<K, V>(iterable: Iterable<readonly [K, V]>): Map<K, V> {
    if (isMap(iterable)) {
      return iterable;
    }

    if (Array.isArray(iterable)) {
      return fromArray(iterable);
    }

    return fromIterable(iterable);
  }

  export function fromArray<K, V>(
    array: ReadonlyArray<readonly [K, V]>,
  ): Map<K, V> {
    return Array.reduce(
      array,
      (map, [key, value]) => map.set(key, value),
      Map.empty(),
    );
  }

  export function fromIterable<K, V>(
    iterable: Iterable<readonly [K, V]>,
  ): Map<K, V> {
    return Iterable.reduce(
      iterable,
      (map, [key, value]) => map.set(key, value),
      Map.empty(),
    );
  }
}

function hash<K>(key: K): number {
  return FNV.empty().writeUnknown(key).finish();
}
