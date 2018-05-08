/**
 * @see https://en.wikipedia.org/wiki/Parent_pointer_tree
 * @internal
 */
export class ParentTree<T> {
  /**
   * Instead of storing the parent tree as a literal tree of parent pointers,
   * we instead use a map in order to provide indexed access to items.
   */
  private _pointers: Map<T, T> = new Map();

  public join(item: T, parent: T): void {
    this._pointers.set(item, parent);
  }

  public get(item: T): T | null {
    const parent = this._pointers.get(item);

    if (parent === undefined) {
      return null;
    }

    return parent;
  }
}
