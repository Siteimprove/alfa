import { Equality } from "@siteimprove/alfa-equality";
import { FNV } from "@siteimprove/alfa-fnv";
import { Foldable } from "@siteimprove/alfa-foldable";
import { Functor } from "@siteimprove/alfa-functor";
import { Hashable } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Monad } from "@siteimprove/alfa-monad";
import { Option } from "@siteimprove/alfa-option";
import { Reducer } from "@siteimprove/alfa-reducer";

import { Empty, Node } from "./node";

const { map, reduce } = Iterable;

export class Map<K, V>
  implements
    Monad<V>,
    Functor<V>,
    Foldable<V>,
    Iterable<[K, V]>,
    Equality<Map<K, V>> {
  public static of<K, V>(...entries: Array<[K, V]>): Map<K, V> {
    return entries.reduce(
      (map, [key, value]) => map.set(key, value),
      Map.empty<K, V>()
    );
  }

  public static empty<K, V>(): Map<K, V> {
    return new Map(Empty.of(), 0);
  }

  private readonly root: Node<K, V>;
  public readonly size: number;

  private constructor(root: Node<K, V>, size: number) {
    this.root = root;
    this.size = size;
  }

  private hash(key: K): number {
    const hash = FNV.empty();

    Hashable.hash(key, hash);

    return hash.finish();
  }

  public has(key: K): boolean {
    return this.get(key).isSome();
  }

  public get(key: K): Option<V> {
    return this.root.get(key, this.hash(key), 0);
  }

  public set(key: K, value: V): Map<K, V> {
    const size = this.size + (this.has(key) ? 0 : 1);

    return new Map(this.root.set(key, this.hash(key), 0, value), size);
  }

  public delete(key: K): Map<K, V> {
    if (this.has(key)) {
      return new Map(this.root.delete(key, this.hash(key), 0), this.size - 1);
    }

    return this;
  }

  public map<U>(mapper: Mapper<V, U, [K]>): Map<K, U> {
    return new Map(this.root.map(mapper), this.size);
  }

  public flatMap<L, U>(mapper: Mapper<V, Map<L, U>, [K]>): Map<L, U> {
    return this.reduce(
      (map, key, value) => map.concat(mapper(key, value)),
      Map.empty<L, U>()
    );
  }

  public reduce<R>(reducer: Reducer<V, R, [K]>, accumulator: R): R {
    return reduce(
      this,
      (accumulator, [key, value]) => reducer(accumulator, value, key),
      accumulator
    );
  }

  public concat(iterable: Iterable<[K, V]>): Map<K, V> {
    return reduce<[K, V], Map<K, V>>(
      iterable,
      (map, [key, value]) => map.set(key, value),
      this
    );
  }

  public equals(value: unknown): value is Map<K, V> {
    return (
      value instanceof Map &&
      value.size === this.size &&
      value.root.equals(this.root)
    );
  }

  public *keys(): Iterable<K> {
    yield* map(this.root, entry => entry[0]);
  }

  public *values(): Iterable<V> {
    yield* map(this.root, entry => entry[1]);
  }

  public *[Symbol.iterator](): Iterator<[K, V]> {
    yield* this.root;
  }
}

export namespace Map {
  export function isMap<K, V>(value: unknown): value is Map<K, V> {
    return value instanceof Map;
  }

  export function from<K, V>(iterable: Iterable<[K, V]>): Map<K, V> {
    return isMap<K, V>(iterable) ? iterable : Map.of(...iterable);
  }
}
