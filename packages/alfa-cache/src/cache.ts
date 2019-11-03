import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Thunk } from "@siteimprove/alfa-thunk";

export class Cache<K, V> {
  public static empty<K extends object, V>(type?: Cache.Type.Weak): Cache<K, V>;

  public static empty<K, V>(type: Cache.Type.Strong): Cache<K, V>;

  public static empty<K extends object, V>(type?: Cache.Type): Cache<K, V> {
    return new Cache(type === Cache.Type.Strong ? new Map() : new WeakMap());
  }

  private readonly entries: Cache.Storage<K, V>;

  private constructor(entries: Cache.Storage<K, V>) {
    this.entries = entries;
  }

  public get<U extends V>(key: K): Option<U>;

  public get<U extends V>(key: K, ifMissing: Thunk<U>): U;

  public get<U extends V>(key: K, ifMissing?: Thunk<U>): U | Option<U> {
    if (this.has(key)) {
      const value = this.entries.get(key) as U;

      if (ifMissing === undefined) {
        return Some.of(value);
      }

      return value;
    }

    if (ifMissing === undefined) {
      return None;
    }

    const value = ifMissing();

    this.entries.set(key, value);

    return value;
  }

  public has(key: K): boolean {
    return this.entries.has(key);
  }

  public set(key: K, value: V): this {
    this.entries.set(key, value);
    return this;
  }

  public merge(iterable: Iterable<[K, V]>): this {
    return Iterable.reduce(
      iterable,
      (cache, [key, value]) => cache.set(key, value),
      this
    );
  }
}

export namespace Cache {
  export type Storage<K, V> = K extends object
    ? Map<K, V> | WeakMap<K, V>
    : Map<K, V>;

  export enum Type {
    Weak,
    Strong
  }

  export function from<K extends object, V>(
    iterable: Iterable<[K, V]>,
    type?: Cache.Type.Weak
  ): Cache<K, V>;

  export function from<K, V>(
    iterable: Iterable<[K, V]>,
    type: Cache.Type.Strong
  ): Cache<K, V>;

  export function from<K extends object, V>(
    iterable: Iterable<[K, V]>,
    type?: Cache.Type
  ): Cache<K, V> {
    const cache: Cache<K, V> =
      type === Cache.Type.Strong ? Cache.empty(type) : Cache.empty(type);

    return cache.merge(iterable);
  }
}
