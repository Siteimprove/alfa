import { ObjectCache } from "./object-cache";

/**
 * @internal
 */
export class ContextCache<Context extends object, Target extends object, Item> {
  private _cache: WeakMap<Context, ObjectCache<Target, Item>> = new WeakMap();

  public get(context: Context, target: Target, factory: () => Item): Item {
    const caches = this._cache;

    let cache = caches.get(context);

    if (cache === undefined) {
      cache = new ObjectCache();
      caches.set(context, cache);
    }

    return cache.get(target, factory);
  }
}
