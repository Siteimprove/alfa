import { Iterable } from "@siteimprove/alfa-iterable";
import { Option, None } from "@siteimprove/alfa-option";
import type { Mapper } from "@siteimprove/alfa-mapper";

/**
 * Caches are wrapper around Javascript's `WeakMap` to store transient values.
 *
 * @remarks
 * Caches are mutable! To preserve referential transparency, the preferred way
 * of using caches is to store them as a local variable (never send them as
 * parameters); and to use a single `cache.get(key, () => …)` call to retrieve
 * values from it. Ideally, use `Cache.memoize()` to create a memoized function.
 *
 * Since Caches are built on WeakMap, the keys must be objects.
 *
 * Since Caches are built on WeakMap, they do not prevent the garbage collection
 * of keys, and the associated value is then freed too. This avoids memory leaks,
 * and ensure a lightweight caching mechanism for objects that stay in memory for
 * some time.
 *
 * Typical use of Caches is to store indirect values related to a DOM tree (e.g.,
 * the associated ARIA tree, …) Once the audit is done and the DOM tree is
 * discarded, the cache is automatically freed.
 *
 * @public
 */
export class Cache<K extends Cache.Key, V> {
  /**
   * Creates an empty cache.
   */
  public static empty<K extends Cache.Key, V>(): Cache<K, V> {
    return new Cache();
  }

  private readonly _storage = new WeakMap<K, V>();

  protected constructor() {}

  /**
   * Returns the value (if it exists) associated with the given key.
   */
  public get(key: K): Option<V>;

  /**
   * Returns the value associated with the given key; if it does not exist,
   * evaluates `ifMissing`, store the result in the cache and returns it.
   */
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

  /**
   * Tests whether a given key exists in the cache.
   */
  public has(key: K): boolean {
    return this._storage.has(key);
  }

  /**
   * Adds a key-value pair to a cache.
   *
   * @remarks
   * Avoid using this. Prefer using the `ifMissing` parameter of `get()` instead.
   */
  public set(key: K, value: V): this {
    this._storage.set(key, value);
    return this;
  }

  /**
   * Merges a cache with an iterable of key-value pairs.
   */
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
  /**
   * Allowed keys in a Cache.
   */
  export type Key = object;

  /**
   * Creates a new cache from an iterable of key-value pairs.
   */
  export function from<K extends Key, V>(
    iterable: Iterable<readonly [K, V]>,
  ): Cache<K, V> {
    return Cache.empty<K, V>().merge(iterable);
  }

  /**
   * Turns `<[A, B, C], T>` into `Cache<A, Cache<B, Cache<C, T>>>`.
   */
  type ToCache<Args extends Array<Key>, T> = Args extends [
    infer Head extends Key,
    ...infer Tail extends Array<Key>,
  ]
    ? Cache<Head, ToCache<Tail, T>>
    : T;

  /**
   * Memoizes a method.
   */
  export function memoize<This, Args extends Array<Key>, Return>(
    // When called on an instance's method `target`, `this` is the instance.
    target: (this: This, ...args: Args) => Return,
  ): (this: This, ...args: Args) => Return;

  /**
   * Memoizes a function
   *
   * @remarks
   * When memoizing a recursive function, care must be taken to also memoize the
   * recursive calls. This is best done by wrapping an anonymous function that
   * recurses on the memoized function:
   * `const foo = Cache.memoize(function (x: A): B { … foo(x2) … })`
   */
  export function memoize<Args extends Array<Key>, Return>(
    target: (...args: Args) => Return,
  ): (...args: Args) => Return;

  export function memoize<This, Args extends Array<Key>, Return>(
    // When called on an instance's method `target`, `this` is the instance.
    target: (this: This, ...args: Args) => Return,
  ): (this: This, ...args: Args) => Return {
    // First, we create the cache.
    const cache = Cache.empty() as ToCache<Args, Return>;

    // Next, we create the memoized function. Since the cache is scoped to the
    // decorator, it cannot be accessed from outside and won't be tampered with.
    return function (this: This, ...args: Args) {
      // Here, `this` is still the instance on which the (new) method is added.
      // We need to save it for later.
      const that = this;

      // We create a recursive memoized function that will traverse the cache,
      // parameter by parameter. It needs to be passed a (partial) cache
      // together with the remaining parameters.
      // This is OK since the side-effect happens only to the previously defined
      // scoped cache.
      function memoized<A extends Array<Key>>(
        cache: ToCache<A, Return>,
        ...innerArgs: A
      ): Return {
        // From now on, `this` is the `memoized` function itself, hence the need
        // for an earlier copy.

        if (innerArgs.length === 0) {
          // We have reached the end of the parameters, always hitting the cache,
          // thus `ToCache<A, Return>` is `Return`, and `cache` is the actual
          // return value that was `.get()` in the previous call.

          // Typescript is completely lost here. It cannot make the connection
          // between `innerArgs` being of length 0, and `A` being `[]`; thus is
          // unable to correctly infer that `ToCache<A, Return>` is `Return`.
          return cache as Return;
        }

        // There are still parameters to handle, deconstruct them.
        const [head, ...tail] = innerArgs;

        // On that bit, TS is so lost that we just disable it…
        // @ts-ignore

        // Compute the next cache to use, by retrieving the values associated
        // with `head`. This will be either the final value (if `head` is the last
        // parameter), or a further cache.
        const next = cache.get(
          head,
          // @ts-ignore
          // If `head` is not in the cache, and there are no more parameters,
          // we need to call the original function. In case of method, we need
          // to re-bind it to the original instance.
          // (we could directly return the result in that case, instead of going
          // to the next call to `memoized`; but since we need to test
          // `innerArgs.length === 0` anyway, we let that handle it)
          //
          // If `head` is not in the cache but there are more parameters,
          // we just create an empty cache.
          tail.length === 0 ? () => target.bind(that)(...args) : Cache.empty,
        );

        // Recurse with the next cache and the remaining parameters.
        return memoized(next, ...tail);
      }

      return memoized(cache, ...args);
    };
  }
}
