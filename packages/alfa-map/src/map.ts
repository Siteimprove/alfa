import { Equatable } from "@siteimprove/alfa-equatable";
import { FNV } from "@siteimprove/alfa-fnv";
import { Foldable } from "@siteimprove/alfa-foldable";
import { Functor } from "@siteimprove/alfa-functor";
import { Hashable } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Monad } from "@siteimprove/alfa-monad";
import { Option } from "@siteimprove/alfa-option";
import { Reducer } from "@siteimprove/alfa-reducer";

import * as json from "@siteimprove/alfa-json";

import { Empty, Node } from "./node";

export class Map<K, V>
  implements Monad<V>, Functor<V>, Foldable<V>, Iterable<[K, V]>, Equatable {
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

  private hash(key: K): number {
    const hash = FNV.empty();

    Hashable.hash(hash, key);

    return hash.finish();
  }

  public has(key: K): boolean {
    return this.get(key).isSome();
  }

  public get(key: K): Option<V> {
    return this._root.get(key, this.hash(key), 0);
  }

  public set(key: K, value: V): Map<K, V> {
    const { result: root, status } = this._root.set(
      key,
      value,
      this.hash(key),
      0
    );

    if (status === "unchanged") {
      return this;
    }

    return new Map(root, this._size + (status === "updated" ? 0 : 1));
  }

  public delete(key: K): Map<K, V> {
    const { result: root, status } = this._root.delete(key, this.hash(key), 0);

    if (status === "unchanged") {
      return this;
    }

    return new Map(root, this._size - 1);
  }

  public map<U>(mapper: Mapper<V, U, [K]>): Map<K, U> {
    return new Map(this._root.map(mapper), this._size);
  }

  public flatMap<L, U>(mapper: Mapper<V, Map<L, U>, [K]>): Map<L, U> {
    return this.reduce(
      (map, key, value) => map.concat(mapper(key, value)),
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
