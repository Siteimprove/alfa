import { Collection } from "@siteimprove/alfa-collection";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Map } from "@siteimprove/alfa-map";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";

import * as json from "@siteimprove/alfa-json";

export class Set<T> implements Collection.Unkeyed<T> {
  public static of<T>(...values: Array<T>): Set<T> {
    return values.reduce((set, value) => set.add(value), Set.empty<T>());
  }

  private static _empty = new Set<never>(Map.empty());

  public static empty<T>(): Set<T> {
    return this._empty;
  }

  private readonly _values: Map<T, T>;

  private constructor(values: Map<T, T>) {
    this._values = values;
  }

  public get size(): number {
    return this._values.size;
  }

  public isEmpty(): this is Set<never> {
    return this._values.isEmpty();
  }

  public map<U>(mapper: Mapper<T, U>): Set<U> {
    return this._values.reduce(
      (set, _, value) => set.add(mapper(value)),
      Set.empty<U>()
    );
  }

  public flatMap<U>(mapper: Mapper<T, Set<U>>): Set<U> {
    return this.reduce(
      (set, value) => set.concat(mapper(value)),
      Set.empty<U>()
    );
  }

  public reduce<U>(reducer: Reducer<T, U>, accumulator: U): U {
    return Iterable.reduce(this, reducer, accumulator);
  }

  public filter<U extends T>(predicate: Predicate<T, U>): Set<U> {
    return this.reduce(
      (set, value) => (predicate(value) ? set.add(value) : set),
      Set.empty<U>()
    );
  }

  public find<U extends T>(predicate: Predicate<T, U>): Option<U> {
    return Iterable.find(this, predicate);
  }

  public includes(value: T): boolean {
    return Iterable.includes(this, value);
  }

  public some(predicate: Predicate<T>): boolean {
    return Iterable.some(this, predicate);
  }

  public every(predicate: Predicate<T>): boolean {
    return Iterable.every(this, predicate);
  }

  public count(predicate: Predicate<T>): number {
    return Iterable.count(this, predicate);
  }

  public get(value: T): Option<T> {
    return this._values.get(value);
  }

  public has(value: T): boolean {
    return this._values.has(value);
  }

  public add(value: T): Set<T> {
    const values = this._values.set(value, value);

    if (values === this._values) {
      return this;
    }

    return new Set(values);
  }

  public delete(value: T): Set<T> {
    const values = this._values.delete(value);

    if (values === this._values) {
      return this;
    }

    return new Set(values);
  }

  public concat(iterable: Iterable<T>): Set<T> {
    return Iterable.reduce<T, Set<T>>(
      iterable,
      (set, value) => set.add(value),
      this
    );
  }

  public equals(value: unknown): value is this {
    return value instanceof Set && value._values.equals(this._values);
  }

  public hash(hash: Hash): void {
    for (const value of this) {
      Hashable.hash(hash, value);
    }

    Hash.writeUint32(hash, this._values.size);
  }

  public *[Symbol.iterator](): Iterator<T> {
    for (const [value] of this._values) {
      yield value;
    }
  }

  public toArray(): Array<T> {
    return [...this];
  }

  public toJSON(): Set.JSON {
    return this.toArray().map(Serializable.toJSON);
  }

  public toString(): string {
    const entries = this.toArray().join(", ");

    return `Set {${entries === "" ? "" : ` ${entries} `}}`;
  }
}

export namespace Set {
  export interface JSON extends Array<json.JSON> {}

  export function isSet<T>(value: unknown): value is Set<T> {
    return value instanceof Set;
  }

  export function from<T>(iterable: Iterable<T>): Set<T> {
    return isSet<T>(iterable) ? iterable : Set.of(...iterable);
  }
}
