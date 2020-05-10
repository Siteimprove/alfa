import { Collection } from "@siteimprove/alfa-collection";
import { FNV } from "@siteimprove/alfa-fnv";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";

import * as json from "@siteimprove/alfa-json";

import { Empty, Node } from "./node";

export class Map<K, V> implements Collection.Keyed<K, V> {
  public static of<K, V>(...entries: Array<[K, V]>): Map<K, V> {
    return entries.reduce(
      (map, [key, value]) => map.set(key, value),
      Map.empty<K, V>()
    );
  }

  private static _empty = new Map<never, never>(Empty.empty(), 0);

  public static empty<K = never, V = never>(): Map<K, V> {
    return this._empty;
  }

  private readonly _root: Node<K, V>;
  private readonly _size: number;

  private constructor(root: Node<K, V>, size: number) {
    this._root = root;
    this._size = size;
  }

  public get size(): number {
    return this._size;
  }

  public isEmpty(): this is Map<K, never> {
    return this._size === 0;
  }

  public map<U>(mapper: Mapper<V, U, [K]>): Map<K, U> {
    return new Map(this._root.map(mapper), this._size);
  }

  public flatMap<L, U>(mapper: Mapper<V, Map<L, U>, [K]>): Map<L, U> {
    return this.reduce(
      (map, value, key) => map.concat(mapper(value, key)),
      Map.empty<L, U>()
    );
  }

  public reduce<R>(reducer: Reducer<V, R, [K]>, accumulator: R): R {
    return Iterable.reduce(
      this,
      (accumulator, [key, value]) => reducer(accumulator, value, key),
      accumulator
    );
  }

  public filter<U extends V>(predicate: Predicate<V, U, [K]>): Map<K, U> {
    return this.reduce(
      (map, value, key) => (predicate(value, key) ? map.set(key, value) : map),
      Map.empty<K, U>()
    );
  }

  public find<U extends V>(predicate: Predicate<V, U, [K]>): Option<U> {
    return Iterable.find(this, ([key, value]) => predicate(value, key)).map(
      ([, value]) => value as U
    );
  }

  public includes(value: V): boolean {
    return Iterable.includes(this.values(), value);
  }

  public some(predicate: Predicate<V, V, [K]>): boolean {
    return Iterable.some(this, ([key, value]) => predicate(value, key));
  }

  public every(predicate: Predicate<V, V, [K]>): boolean {
    return Iterable.every(this, ([key, value]) => predicate(value, key));
  }

  public count(predicate: Predicate<V, V, [K]>): number {
    return Iterable.count(this, ([key, value]) => predicate(value, key));
  }

  public get(key: K): Option<V> {
    return this._root.get(key, this._hash(key), 0);
  }

  public has(key: K): boolean {
    return this.get(key).isSome();
  }

  public set(key: K, value: V): Map<K, V> {
    const { result: root, status } = this._root.set(
      key,
      value,
      this._hash(key),
      0
    );

    if (status === "unchanged") {
      return this;
    }

    return new Map(root, this._size + (status === "updated" ? 0 : 1));
  }

  public delete(key: K): Map<K, V> {
    const { result: root, status } = this._root.delete(key, this._hash(key), 0);

    if (status === "unchanged") {
      return this;
    }

    return new Map(root, this._size - 1);
  }

  public concat(iterable: Iterable<[K, V]>): Map<K, V> {
    return Iterable.reduce<[K, V], Map<K, V>>(
      iterable,
      (map, [key, value]) => map.set(key, value),
      this
    );
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Map &&
      value._size === this._size &&
      value._root.equals(this._root)
    );
  }

  public hash(hash: Hash): void {
    for (const [key, value] of this) {
      Hashable.hash(hash, key);
      Hashable.hash(hash, value);
    }

    Hash.writeUint32(hash, this._size);
  }

  public keys(): Iterable<K> {
    return Iterable.map(this._root, (entry) => entry[0]);
  }

  public values(): Iterable<V> {
    return Iterable.map(this._root, (entry) => entry[1]);
  }

  public *[Symbol.iterator](): Iterator<[K, V]> {
    yield* this._root;
  }

  public toArray(): Array<[K, V]> {
    return [...this];
  }

  public toJSON(): Map.JSON {
    return this.toArray().map(([key, value]) => [
      Serializable.toJSON(key),
      Serializable.toJSON(value),
    ]);
  }

  public toString(): string {
    const entries = this.toArray()
      .map(([key, value]) => `${key} => ${value}`)
      .join(", ");

    return `Map {${entries === "" ? "" : ` ${entries} `}}`;
  }

  private _hash(key: K): number {
    const hash = FNV.empty();

    Hashable.hash(hash, key);

    return hash.finish();
  }
}

export namespace Map {
  export interface JSON extends Array<[json.JSON, json.JSON]> {}

  export function isMap<K, V>(value: unknown): value is Map<K, V> {
    return value instanceof Map;
  }

  export function from<K, V>(iterable: Iterable<[K, V]>): Map<K, V> {
    return isMap<K, V>(iterable) ? iterable : Map.of(...iterable);
  }
}
