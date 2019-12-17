import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Thunk } from "@siteimprove/alfa-thunk";

const { isObject } = Predicate;

export class Cache<K, V> {
  public static empty<K, V>(): Cache<K, V> {
    return new Cache();
  }

  private readonly _storage = Storage.empty<K, V>();

  private constructor() {}

  public get(key: K): Option<V>;

  public get<U extends V = V>(key: K, ifMissing: Thunk<U>): V;

  public get<U extends V = V>(key: K, ifMissing?: Thunk<U>): V | Option<V> {
    if (this.has(key)) {
      const value = this._storage.get(key);

      if (ifMissing === undefined) {
        return value;
      }

      return value.getOrElse(ifMissing);
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

  public merge(iterable: Iterable<[K, V]>): this {
    return Iterable.reduce(
      iterable,
      (cache, [key, value]) => cache.set(key, value),
      this
    );
  }

  public toJSON() {
    return {};
  }
}

export namespace Cache {
  export function from<K, V>(iterable: Iterable<[K, V]>): Cache<K, V> {
    return Cache.empty<K, V>().merge(iterable);
  }
}

class Storage<K, V> {
  public static empty<K, V>(): Storage<K, V> {
    return new Storage();
  }

  private readonly _objects: WeakMap<object, V> = new WeakMap();
  private readonly _primitives: Map<unknown, V> = new Map();

  private constructor() {}

  public get(key: K): Option<V> {
    let value: V;

    if (isObject(key)) {
      if (this._objects.has(key)) {
        value = this._objects.get(key)!;
      } else {
        return None;
      }
    } else {
      if (this._primitives.has(key)) {
        value = this._primitives.get(key)!;
      } else {
        return None;
      }
    }

    return Some.of(value);
  }

  public has(key: K) {
    if (isObject(key)) {
      return this._objects.has(key);
    } else {
      return this._primitives.has(key);
    }
  }

  public set(key: K, value: V) {
    if (isObject(key)) {
      this._objects.set(key, value);
    } else {
      this._primitives.set(key, value);
    }
  }

  public toJSON() {
    return {};
  }
}
