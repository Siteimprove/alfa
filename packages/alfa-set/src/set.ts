import { Array } from "@siteimprove/alfa-array";
import { Callback } from "@siteimprove/alfa-callback";
import { Collection } from "@siteimprove/alfa-collection";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Map } from "@siteimprove/alfa-map";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";
import { Refinement } from "@siteimprove/alfa-refinement";

const { not } = Predicate;

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

  public forEach(callback: Callback<T>): void {
    Iterable.forEach(this, callback);
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

  public apply<U>(mapper: Set<Mapper<T, U>>): Set<U> {
    return this.flatMap((value) => mapper.map((mapper) => mapper(value)));
  }

  public filter<U extends T>(refinement: Refinement<T, U>): Set<U>;

  public filter(predicate: Predicate<T>): Set<T>;

  public filter(predicate: Predicate<T>): Set<T> {
    return this.reduce(
      (set, value) => (predicate(value) ? set.add(value) : set),
      Set.empty()
    );
  }

  public reject<U extends T>(refinement: Refinement<T, U>): Set<Exclude<T, U>>;

  public reject(predicate: Predicate<T>): Set<T>;

  public reject(predicate: Predicate<T>): Set<T> {
    return this.filter(not(predicate));
  }

  public find<U extends T>(refinement: Refinement<T, U>): Option<U>;

  public find(predicate: Predicate<T>): Option<T>;

  public find(predicate: Predicate<T>): Option<T> {
    return Iterable.find(this, predicate);
  }

  public includes(value: T): boolean {
    return Iterable.includes(this, value);
  }

  public collect<U>(mapper: Mapper<T, Option<U>>): Set<U> {
    return Set.from(Iterable.collect(this, mapper));
  }

  public collectFirst<U>(mapper: Mapper<T, Option<U>>): Option<U> {
    return Iterable.collectFirst(this, mapper);
  }

  public some(predicate: Predicate<T>): boolean {
    return Iterable.some(this, predicate);
  }

  public none(predicate: Predicate<T>): boolean {
    return Iterable.none(this, predicate);
  }

  public every(predicate: Predicate<T>): boolean {
    return Iterable.every(this, predicate);
  }

  public count(predicate: Predicate<T>): number {
    return Iterable.count(this, predicate);
  }

  /**
   * @remarks
   * As sets don't contain duplicate values, they will only ever contain
   * distinct values.
   */
  public distinct(): Set<T> {
    return this;
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

  public toJSON(): Set.JSON<T> {
    return this.toArray().map((value) => Serializable.toJSON(value));
  }

  public toString(): string {
    const entries = this.toArray().join(", ");

    return `Set {${entries === "" ? "" : ` ${entries} `}}`;
  }
}

export namespace Set {
  export type JSON<T> = Collection.Unkeyed.JSON<T>;

  export function isSet<T>(value: Iterable<T>): value is Set<T>;

  export function isSet<T>(value: unknown): value is Set<T>;

  export function isSet<T>(value: unknown): value is Set<T> {
    return value instanceof Set;
  }

  export function from<T>(iterable: Iterable<T>): Set<T> {
    if (isSet(iterable)) {
      return iterable;
    }

    if (Array.isArray(iterable)) {
      return fromArray(iterable);
    }

    return fromIterable(iterable);
  }

  export function fromArray<T>(array: Array<T>): Set<T> {
    return Array.reduce(array, (set, value) => set.add(value), Set.empty());
  }

  export function fromIterable<T>(iterable: Iterable<T>): Set<T> {
    return Iterable.reduce(
      iterable,
      (set, value) => set.add(value),
      Set.empty()
    );
  }
}
