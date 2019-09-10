export class Cache<K, V> {
  private readonly items: Cache.Storage<K, V>;

  public constructor(items: Cache.Storage<K, V>) {
    this.items = items;
  }

  public get(key: K, factory: () => V): V {
    let value = this.items.get(key);

    if (value === undefined) {
      value = factory();
      this.set(key, value);
    }

    return value;
  }

  public set(key: K, value: V): void {
    this.items.set(key, value);
  }
}

export namespace Cache {
  export type Storage<K, V> = K extends object ? WeakMap<K, V> : Map<K, V>;

  export function of<K extends object, V>(
    options?: of.Options & { readonly weak?: true }
  ): Cache<K, V>;

  export function of<K, V>(
    options: of.Options & { readonly weak: false }
  ): Cache<K, V>;

  export function of<K, V>(options: of.Options = {}): Cache<K, V> {
    let storage: Cache.Storage<K, V>;

    if (options.weak === false) {
      storage = new Map() as Cache.Storage<K, V>;
    } else {
      storage = new WeakMap() as Cache.Storage<K, V>;
    }

    return new Cache(storage);
  }

  export namespace of {
    export interface Options {
      readonly weak?: boolean;
    }
  }
}
