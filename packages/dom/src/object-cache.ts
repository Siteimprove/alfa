/**
 * @internal
 */
export class ObjectCache<Target extends object, Item> {
  private _cache: WeakMap<Target, Item> = new WeakMap();

  public get(target: Target, factory: () => Item): Item {
    const items = this._cache;

    let item = items.get(target);

    if (item === undefined) {
      item = factory();
      items.set(target, item);
    }

    return item;
  }
}
