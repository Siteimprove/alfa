import { Array } from "@siteimprove/alfa-array";
import type { Callback } from "@siteimprove/alfa-callback";
import type { Collection } from "@siteimprove/alfa-collection";
import { Equatable } from "@siteimprove/alfa-equatable";
import type { Hash } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import type { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import type { Reducer } from "@siteimprove/alfa-reducer";
import type { Refinement } from "@siteimprove/alfa-refinement";

const { not } = Predicate;

/**
 * @public
 *
 * A mutable Map implementation for value-based keys (number, string, boolean).
 *
 * @remarks
 * This map uses JavaScript's native Map internally for O(1) lookup performance without
 * hashing overhead. Calling `set` or `delete` mutates the the map whereas, `map`, `filter`, etc. creates new instances.
 *
 * Value types (primitives) are compared by value, not reference.
 *
 * For maps that need to use objects as keys with structural equality, use the standard
 * `Map` class instead.
 * ```
 */
export class MutableMap<K, V> implements Collection.Keyed<K, V> {
  public static of<K, V>(...entries: Array<readonly [K, V]>): MutableMap<K, V> {
    return new MutableMap(new Map<K, V>(entries));
  }

  public static empty<K = never, V = never>(): MutableMap<K, V> {
    return new MutableMap<never, never>(new Map<never, never>());
  }

  private readonly _storage: Map<K, V>;

  protected constructor(storage: Map<K, V>) {
    this._storage = storage;
  }

  public get size(): number {
    return this._storage.size;
  }

  public isEmpty(): this is MutableMap<K, never> {
    return this.size === 0;
  }

  public forEach(callback: Callback<V, void, [key: K]>): void {
    for (const [key, value] of this._storage) {
      callback(value, key);
    }
  }

  public map<U>(mapper: Mapper<V, U, [key: K]>): MutableMap<K, U> {
    const newStorage = new Map<K, U>();
    for (const [key, value] of this._storage) {
      newStorage.set(key, mapper(value, key));
    }
    return new MutableMap(newStorage);
  }

  public apply<U>(mapper: MutableMap<K, Mapper<V, U>>): MutableMap<K, U> {
    return this.collect((value, key) =>
      mapper.get(key).map((mapper) => mapper(value)),
    );
  }

  public flatMap<L, U>(
    mapper: Mapper<V, MutableMap<L, U>, [key: K]>,
  ): MutableMap<L, U> {
    return this.reduce(
      (map, value, key) => map.concat(mapper(value, key)),
      MutableMap.empty<L, U>(),
    );
  }

  public flatten<K, V>(
    this: MutableMap<K, MutableMap<K, V>>,
  ): MutableMap<K, V> {
    return this.flatMap((map) => map);
  }

  public reduce<R>(reducer: Reducer<V, R, [key: K]>, accumulator: R): R {
    for (const [key, value] of this._storage) {
      accumulator = reducer(accumulator, value, key);
    }
    return accumulator;
  }

  public filter<U extends V>(
    refinement: Refinement<V, U, [key: K]>,
  ): MutableMap<K, U>;

  public filter(predicate: Predicate<V, [key: K]>): MutableMap<K, V>;

  public filter(predicate: Predicate<V, [key: K]>): MutableMap<K, V> {
    const newStorage = new Map<K, V>();
    for (const [key, value] of this._storage) {
      if (predicate(value, key)) {
        newStorage.set(key, value);
      }
    }
    return new MutableMap(newStorage);
  }

  public reject<U extends V>(
    refinement: Refinement<V, U, [key: K]>,
  ): MutableMap<K, Exclude<V, U>>;

  public reject(predicate: Predicate<V, [key: K]>): MutableMap<K, V>;

  public reject(predicate: Predicate<V, [key: K]>): MutableMap<K, V> {
    return this.filter(not(predicate));
  }

  public find<U extends V>(refinement: Refinement<V, U, [key: K]>): Option<U>;

  public find(predicate: Predicate<V, [key: K]>): Option<V>;

  public find(predicate: Predicate<V, [key: K]>): Option<V> {
    for (const [key, value] of this._storage) {
      if (predicate(value, key)) {
        return Option.of(value);
      }
    }
    return None;
  }

  public includes(value: V): boolean {
    for (const v of this._storage.values()) {
      if (Equatable.equals(v, value)) {
        return true;
      }
    }
    return false;
  }

  public collect<U>(mapper: Mapper<V, Option<U>, [key: K]>): MutableMap<K, U> {
    const newStorage = new Map<K, U>();
    for (const [key, value] of this._storage) {
      const result = mapper(value, key);
      if (result.isSome()) {
        newStorage.set(key, result.get());
      }
    }
    return new MutableMap(newStorage);
  }

  public collectFirst<U>(mapper: Mapper<V, Option<U>, [key: K]>): Option<U> {
    for (const [key, value] of this._storage) {
      const result = mapper(value, key);
      if (result.isSome()) {
        return result;
      }
    }
    return None;
  }

  public some(predicate: Predicate<V, [key: K]>): boolean {
    for (const [key, value] of this._storage) {
      if (predicate(value, key)) {
        return true;
      }
    }
    return false;
  }

  public none(predicate: Predicate<V, [key: K]>): boolean {
    return !this.some(predicate);
  }

  public every(predicate: Predicate<V, [key: K]>): boolean {
    for (const [key, value] of this._storage) {
      if (!predicate(value, key)) {
        return false;
      }
    }
    return true;
  }

  public count(predicate: Predicate<V, [key: K]>): number {
    let count = 0;
    for (const [key, value] of this._storage) {
      if (predicate(value, key)) {
        count++;
      }
    }
    return count;
  }

  public distinct(): MutableMap<K, V> {
    const seen = new Map<V, boolean>();
    const newStorage = new Map<K, V>();

    for (const [key, value] of this._storage) {
      // Check if we've seen this value before using Equatable.equals
      let isDuplicate = false;
      for (const seenValue of seen.keys()) {
        if (Equatable.equals(value, seenValue)) {
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        newStorage.set(key, value);
        seen.set(value, true);
      }
    }

    return new MutableMap(newStorage);
  }

  public get(key: K): Option<V> {
    const value = this._storage.get(key);
    return value === undefined ? None : Option.of(value);
  }

  public has(key: K): boolean {
    return this._storage.has(key);
  }

  public set(key: K, value: V): MutableMap<K, V> {
    this._storage.set(key, value);
    return this;
  }

  public delete(key: K): MutableMap<K, V> {
    this._storage.delete(key);
    return this;
  }

  public concat(iterable: Iterable<readonly [K, V]>): MutableMap<K, V> {
    const newStorage = new Map(this._storage);
    for (const [key, value] of iterable) {
      newStorage.set(key, value);
    }
    return new MutableMap(newStorage);
  }

  public subtract(iterable: Iterable<readonly [K, V]>): MutableMap<K, V> {
    const newStorage = new Map(this._storage);
    for (const [key] of iterable) {
      newStorage.delete(key);
    }
    return new MutableMap(newStorage);
  }

  public intersect(iterable: Iterable<readonly [K, V]>): MutableMap<K, V> {
    const newStorage = new Map<K, V>();
    for (const [key, value] of iterable) {
      if (this._storage.has(key)) {
        newStorage.set(key, value);
      }
    }
    return new MutableMap(newStorage);
  }

  public tee<A extends Array<unknown> = []>(
    callback: Callback<this, void, [...args: A]>,
    ...args: A
  ): this {
    callback(this, ...args);
    return this;
  }

  public equals<K, V>(value: MutableMap<K, V>): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    if (!(value instanceof MutableMap)) {
      return false;
    }

    if (value._storage.size !== this._storage.size) {
      return false;
    }

    for (const [key, val] of this._storage) {
      const otherVal = value._storage.get(key);
      if (otherVal === undefined || !Equatable.equals(val, otherVal)) {
        return false;
      }
    }

    return true;
  }

  public hash(hash: Hash): void {
    for (const [key, value] of this._storage) {
      hash.writeUnknown(key).writeUnknown(value);
    }

    hash.writeUint32(this._storage.size);
  }

  public keys(): Iterable<K> {
    return this._storage.keys();
  }

  public values(): Iterable<V> {
    return this._storage.values();
  }

  public *iterator(): Iterator<[K, V]> {
    yield* this._storage;
  }

  public [Symbol.iterator](): Iterator<[K, V]> {
    return this.iterator();
  }

  public toArray(): Array<[K, V]> {
    return [...this._storage];
  }

  public toJSON(options?: Serializable.Options): MutableMap.JSON<K, V> {
    return this.toArray().map(([key, value]) => [
      Serializable.toJSON(key, options),
      Serializable.toJSON(value, options),
    ]);
  }

  public toString(): string {
    const entries = this.toArray()
      .map(([key, value]) => `${key} => ${value}`)
      .join(", ");

    return `MutableMap {${entries === "" ? "" : ` ${entries} `}}`;
  }
}

/**
 * @public
 */
export namespace MutableMap {
  export type JSON<K, V> = Collection.Keyed.JSON<K, V>;

  export function isMutableMap<K, V>(
    value: Iterable<readonly [K, V]>,
  ): value is MutableMap<K, V>;

  export function isMutableMap<K, V>(value: unknown): value is MutableMap<K, V>;

  export function isMutableMap<K, V>(
    value: unknown,
  ): value is MutableMap<K, V> {
    return value instanceof MutableMap;
  }

  export function from<K, V>(
    iterable: Iterable<readonly [K, V]>,
  ): MutableMap<K, V> {
    if (isMutableMap(iterable)) {
      return iterable;
    }

    if (Array.isArray(iterable)) {
      return fromArray(iterable);
    }

    return fromIterable(iterable);
  }

  export function fromArray<K, V>(
    array: ReadonlyArray<readonly [K, V]>,
  ): MutableMap<K, V> {
    return MutableMap.of<K, V>(...array);
  }

  export function fromIterable<K, V>(
    iterable: Iterable<readonly [K, V]>,
  ): MutableMap<K, V> {
    return MutableMap.of<K, V>(...iterable);
  }
}
