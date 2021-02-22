import { Iterable } from "@siteimprove/alfa-iterable";
import { Option, None } from "@siteimprove/alfa-option";
import { Thunk } from "@siteimprove/alfa-thunk";

export class Cache<K extends object, V> {
  public static empty<K extends object, V>(): Cache<K, V> {
    return new Cache();
  }

  private readonly _storage = new WeakMap<K, V>();

  private constructor() {}

  public get(key: K): Option<V>;

  public get<U extends V = V>(key: K, ifMissing: Thunk<U>): V;

  public get<U extends V = V>(key: K, ifMissing?: Thunk<U>): V | Option<V> {
    if (this._storage.has(key)) {
      const value = this._storage.get(key)!;

      if (ifMissing === undefined) {
        return Option.of(value);
      }

      return value;
    }

    if (ifMissing === undefined) {
      return None;
    }

    const value = ifMissing();

    this._storage.set(key, value);

    return value;
  }

  public has(key: K): boolean {
    return this._storage.has(key);
  }

  public set(key: K, value: V): this {
    this._storage.set(key, value);
    return this;
  }

  public merge(iterable: Iterable<readonly [K, V]>): this {
    return Iterable.reduce(
      iterable,
      (cache, [key, value]) => cache.set(key, value),
      this
    );
  }
}

export namespace Cache {
  export function from<K extends object, V>(
    iterable: Iterable<readonly [K, V]>
  ): Cache<K, V> {
    return Cache.empty<K, V>().merge(iterable);
  }
}
