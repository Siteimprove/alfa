import { Callback } from "@siteimprove/alfa-callback";
import { Collection } from "@siteimprove/alfa-collection";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { List } from "@siteimprove/alfa-list";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";
import { Refinement } from "@siteimprove/alfa-refinement";

const { not } = Predicate;

export class Branched<T, B = never>
  implements Collection<T>, Iterable<[T, Iterable<B>]> {
  public static of<T, B = never>(
    value: T,
    ...branches: Array<B>
  ): Branched<T, B> {
    return new Branched<T, B>(
      List.of(
        Value.of(
          value,
          branches.length === 0 ? None : Some.of(List.from(branches))
        )
      )
    );
  }

  private readonly _values: List<Value<T, B>>;

  private constructor(values: List<Value<T, B>>) {
    this._values = values;
  }

  public get size(): number {
    return this._values.size;
  }

  public isEmpty(): this is Branched<never, B> {
    return false;
  }

  public forEach(callback: Callback<T, void, [Iterable<B>]>): void {
    this._values.forEach(({ value, branches }) =>
      callback(
        value,
        branches.getOrElse(() => List.empty())
      )
    );
  }

  public map<U>(mapper: Mapper<T, U, [Iterable<B>]>): Branched<U, B> {
    return new Branched(
      this._values.reduce(
        (values, { value, branches }) =>
          merge(
            values,
            mapper(
              value,
              branches.getOrElse(() => List.empty())
            ),
            branches
          ),
        List.empty()
      )
    );
  }

  public flatMap<U>(
    mapper: Mapper<T, Branched<U, B>, [Iterable<B>]>
  ): Branched<U, B> {
    return new Branched(
      this._values.reduce(
        (values, { value, branches: scope }) =>
          mapper(
            value,
            scope.getOrElse(() => List.empty())
          )._values.reduce((values, { value, branches }) => {
            if (scope.isNone() && branches.isSome()) {
              branches = unused(branches, this._values);
            } else {
              branches = narrow(branches, scope);
            }

            return merge(values, value, branches);
          }, values),
        List.empty()
      )
    );
  }

  public reduce<U>(reducer: Reducer<T, U, [Iterable<B>]>, accumulator: U): U {
    return this._values.reduce(
      (accumulator, value) =>
        reducer(
          accumulator,
          value.value,
          value.branches.getOrElse(() => List.empty())
        ),
      accumulator
    );
  }

  public apply<U>(mapper: Branched<Mapper<T, U>, B>): Branched<U, B> {
    return this.flatMap((value) => mapper.map((mapper) => mapper(value)));
  }

  public filter<U extends T>(
    refinement: Refinement<T, U, [Iterable<B>]>
  ): Branched<U, B>;

  public filter(predicate: Predicate<T, [Iterable<B>]>): Branched<T, B>;

  public filter(predicate: Predicate<T, [Iterable<B>]>): Branched<T, B> {
    return new Branched(
      this._values.filter(({ value, branches }) =>
        predicate(
          value,
          branches.getOrElse(() => List.empty())
        )
      )
    );
  }

  public reject<U extends T>(
    refinement: Refinement<T, U, [Iterable<B>]>
  ): Branched<Exclude<T, U>, B>;

  public reject(predicate: Predicate<T, [Iterable<B>]>): Branched<T, B>;

  public reject(predicate: Predicate<T, [Iterable<B>]>): Branched<T, B> {
    return this.filter(not(predicate));
  }

  public find<U extends T>(
    refinement: Refinement<T, U, [Iterable<B>]>
  ): Option<U>;

  public find(predicate: Predicate<T, [Iterable<B>]>): Option<T>;

  public find(predicate: Predicate<T, [Iterable<B>]>): Option<T> {
    return this._values
      .find(({ value, branches }) =>
        predicate(
          value,
          branches.getOrElse(() => List.empty())
        )
      )
      .map(({ value }) => value);
  }

  public includes(value: T): boolean {
    return this._values.some(({ value: found }) =>
      Equatable.equals(value, found)
    );
  }

  public collect<U>(
    mapper: Mapper<T, Option<U>, [Iterable<B>]>
  ): Branched<U, B> {
    return new Branched(
      this._values.reduce(
        (values, { value, branches }) =>
          mapper(
            value,
            branches.getOrElse(() => List.empty())
          )
            .map((value) => merge(values, value, branches))
            .getOr(values),
        List.empty()
      )
    );
  }

  public collectFirst<U>(
    mapper: Mapper<T, Option<U>, [Iterable<B>]>
  ): Option<U> {
    return this._values.collectFirst(({ value, branches }) =>
      mapper(
        value,
        branches.getOrElse(() => List.empty())
      )
    );
  }

  public some(predicate: Predicate<T, [Iterable<B>]>): boolean {
    for (const value of this._values) {
      if (
        predicate(
          value.value,
          value.branches.getOrElse(() => List.empty())
        )
      ) {
        return true;
      }
    }

    return false;
  }

  public none(predicate: Predicate<T, [Iterable<B>]>): boolean {
    return this.every(not(predicate));
  }

  public every(predicate: Predicate<T, [Iterable<B>]>): boolean {
    for (const value of this._values) {
      if (
        !predicate(
          value.value,
          value.branches.getOrElse(() => List.empty())
        )
      ) {
        return false;
      }
    }

    return true;
  }

  public count(predicate: Predicate<T, [Iterable<B>]>): number {
    return this.reduce(
      (count, value, branches) =>
        predicate(value, branches) ? count + 1 : count,
      0
    );
  }

  /**
   * @remarks
   * As branched values merges branches with duplicate values, they will only
   * ever contain distinct values.
   */
  public distinct(): Branched<T, B> {
    return this;
  }

  public branch(value: T, ...branches: Array<B>): Branched<T, B> {
    return new Branched(
      merge(
        this._values,
        value,
        branches.length === 0 ? None : Some.of(List.from(branches))
      )
    );
  }

  public equals(value: unknown): value is this {
    return value instanceof Branched && value._values.equals(this._values);
  }

  public hash(hash: Hash): void {
    this._values.hash(hash);
  }

  public *[Symbol.iterator](): Iterator<[T, Iterable<B>]> {
    for (const value of this._values) {
      yield [value.value, value.branches.getOrElse(() => List.empty())];
    }
  }

  public toArray(): Array<[T, Array<B>]> {
    return this._values
      .toArray()
      .map(({ value, branches }) => [
        value,
        branches.getOrElse(() => List.empty()).toArray(),
      ]);
  }

  public toJSON(): Branched.JSON<T, B> {
    return this._values
      .toArray()
      .map(({ value, branches }) => [
        Serializable.toJSON(value),
        branches.getOrElse(() => List.empty()).toJSON(),
      ]);
  }
}

export namespace Branched {
  export type JSON<T, B = never> = Array<
    [Serializable.ToJSON<T>, Array<Serializable.ToJSON<B>>]
  >;

  export function isBranched<T, B = never>(
    value: unknown
  ): value is Branched<T, B> {
    return value instanceof Branched;
  }

  export function from<T, B = never>(
    values: Iterable<readonly [T, Iterable<B>]>
  ): Branched<T, B> {
    if (isBranched<T, B>(values)) {
      return values;
    }

    const [[value, branches], ...rest] = values;

    return rest.reduce(
      (result, [value, branches]) => result.branch(value, ...branches),
      Branched.of(value, ...branches)
    );
  }

  export function traverse<T, U, B>(
    values: Iterable<T>,
    mapper: Mapper<T, Branched<U, B>>
  ): Branched<Iterable<U>, B> {
    return Iterable.reduce(
      values,
      (values, value) =>
        values.flatMap((values) =>
          mapper(value).map((value) => values.append(value))
        ),
      Branched.of(List.empty())
    );
  }

  export function sequence<T, B>(
    values: Iterable<Branched<T, B>>
  ): Branched<Iterable<T>, B> {
    return traverse(values, (value) => value);
  }
}

class Value<T, B> implements Equatable, Hashable {
  public static of<T, B>(
    value: T,
    branches: Option<List<B>> = None
  ): Value<T, B> {
    return new Value(value, branches);
  }

  private readonly _value: T;
  private readonly _branches: Option<List<B>>;

  private constructor(value: T, branches: Option<List<B>>) {
    this._value = value;
    this._branches = branches;
  }

  public get value(): T {
    return this._value;
  }

  public get branches(): Option<List<B>> {
    return this._branches;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Value &&
      Equatable.equals(value._value, this._value) &&
      Equatable.equals(value._branches, this._branches)
    );
  }

  public hash(hash: Hash): void {
    Hashable.hash(hash, this._value);
    this._branches.hash(hash);
  }
}

function merge<T, B>(
  values: List<Value<T, B>>,
  value: T,
  branches: Option<List<B>>
): List<Value<T, B>> {
  branches = values
    .find((existing) => Equatable.equals(existing.value, value))
    .map((existing) =>
      existing.branches.flatMap((left) =>
        branches.map((right) => left.concat(right))
      )
    )
    .getOr(branches);

  return deduplicate(values, value, branches).append(Value.of(value, branches));
}

function deduplicate<T, B>(
  values: List<Value<T, B>>,
  value: T,
  branches: Option<List<B>>
): List<Value<T, B>> {
  return values.reduce((values, existing) => {
    if (Equatable.equals(existing.value, value)) {
      return values;
    }

    if (existing.branches.isNone()) {
      return branches.isNone() ? values : values.append(existing);
    }

    return existing.branches.reduce((values, existingBranches) => {
      const deduplicated = branches.reduce(
        (existing, branches) => existing.subtract(branches),
        existingBranches
      );

      if (deduplicated.size === 0) {
        return values;
      }

      return values.append(Value.of(existing.value, Some.of(deduplicated)));
    }, values);
  }, List.empty());
}

function narrow<T, B>(
  branches: Option<List<B>>,
  scope: Option<List<B>>
): Option<List<B>> {
  return scope.map((scope) =>
    branches.reduce((scope, branches) => scope.intersect(branches), scope)
  );
}

function unused<T, B>(
  branches: Option<List<B>>,
  values: List<Value<T, B>>
): Option<List<B>> {
  return values.reduce(
    (branches, value) =>
      value.branches
        .flatMap((existing) =>
          branches.map((branches) => branches.subtract(existing))
        )
        .or(branches),
    branches
  );
}
