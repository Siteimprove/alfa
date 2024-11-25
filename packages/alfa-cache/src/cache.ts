import { Iterable } from "@siteimprove/alfa-iterable";
import { Option, None } from "@siteimprove/alfa-option";
import type { Mapper } from "@siteimprove/alfa-mapper";

/**
 * @public
 */
export class Cache<K extends Cache.Key, V> {
  public static empty<K extends Cache.Key, V>(): Cache<K, V> {
    return new Cache();
  }

  private readonly _storage = new WeakMap<K, V>();

  private constructor() {}

  public get(key: K): Option<V>;

  public get<U extends V = V>(key: K, ifMissing: Mapper<this, U>): V;

  public get<U extends V = V>(
    key: K,
    ifMissing?: Mapper<this, U>,
  ): V | Option<V> {
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

    const value = ifMissing(this);

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
      this,
    );
  }
}

/**
 * @public
 */
export namespace Cache {
  export type Key = object;

  export function from<K extends Key, V>(
    iterable: Iterable<readonly [K, V]>,
  ): Cache<K, V> {
    return Cache.empty<K, V>().merge(iterable);
  }

  type ToCache<Args extends Array<object>, T> = Args extends [
    infer Head extends object,
    ...infer Tail extends Array<object>,
  ]
    ? Cache<Head, ToCache<Tail, T>>
    : T;

  export function memoize<This, Args extends Array<object>, Return>(
    target: (this: This, ...args: Args) => Return,
  ): (this: This, ...args: Args) => Return {
    const cache = Cache.empty() as ToCache<Args, Return>;

    return function (this: This, ...args: Args) {
      const that = this;
      function memoized<A extends Array<Object>>(
        cache: ToCache<A, Return>,
        ...inner: A
      ): Return {
        if (inner.length === 0) {
          return cache as Return;
        }

        const [head, ...tail] = inner;
        // @ts-ignore
        const next = cache.get(
          head,
          // @ts-ignore
          tail.length === 0 ? () => target.bind(that)(...args) : Cache.empty,
        );
        return memoized(next, ...tail);
      }

      return memoized(cache, ...args);
    };
  }
}
