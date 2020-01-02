import { Equatable } from "@siteimprove/alfa-equatable";
import { Foldable } from "@siteimprove/alfa-foldable";
import { Functor } from "@siteimprove/alfa-functor";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Map } from "@siteimprove/alfa-map";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Monad } from "@siteimprove/alfa-monad";
import { Reducer } from "@siteimprove/alfa-reducer";

export class Set<T>
  implements Monad<T>, Functor<T>, Foldable<T>, Iterable<T>, Equatable {
  public static of<T>(...values: Array<T>): Set<T> {
    return values.reduce((set, value) => set.add(value), Set.empty<T>());
  }

  public static empty<T>(): Set<T> {
    return new Set(Map.empty());
  }

  private readonly _values: Map<T, true>;

  private constructor(values: Map<T, true>) {
    this._values = values;
  }

  public get size(): number {
    return this._values.size;
  }

  public has(value: T): boolean {
    return this._values.has(value);
  }

  public add(value: T): Set<T> {
    return new Set(this._values.set(value, true));
  }

  public delete(value: T): Set<T> {
    return new Set(this._values.delete(value));
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

  public reduce<R>(reducer: Reducer<T, R>, accumulator: R): R {
    return Iterable.reduce(this, reducer, accumulator);
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

  public *[Symbol.iterator](): Iterator<T> {
    for (const [value] of this._values) {
      yield value;
    }
  }

  public toJSON() {
    return [...this._values.keys()];
  }

  public toString(): string {
    const entries = [...this].join(", ");

    return `Set {${entries === "" ? "" : ` ${entries} `}}`;
  }
}

export namespace Set {
  export function isSet<T>(value: unknown): value is Set<T> {
    return value instanceof Set;
  }

  export function from<T>(iterable: Iterable<T>): Set<T> {
    return isSet<T>(iterable) ? iterable : Set.of(...iterable);
  }
}
