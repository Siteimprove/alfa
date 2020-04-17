import { Applicative } from "@siteimprove/alfa-applicative";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Foldable } from "@siteimprove/alfa-foldable";
import { Functor } from "@siteimprove/alfa-functor";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { List } from "@siteimprove/alfa-list";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Monad } from "@siteimprove/alfa-monad";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";

import * as json from "@siteimprove/alfa-json";

export class Branched<T, B = never>
  implements
    Monad<T>,
    Functor<T>,
    Applicative<T>,
    Foldable<T>,
    Iterable<[T, Iterable<B>]>,
    Equatable,
    Serializable {
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

  public branch(value: T, ...branches: Array<B>): Branched<T, B> {
    return new Branched(
      merge(
        this._values,
        value,
        branches.length === 0 ? None : Some.of(List.from(branches))
      )
    );
  }

  public map<U>(mapper: Mapper<T, U, [Iterable<B>]>): Branched<U, B> {
    return new Branched(
      this._values.map(({ value, branches }) => {
        return Value.of(mapper(value, branches.getOr([])), branches);
      })
    );
  }

  public flatMap<U>(
    mapper: Mapper<T, Branched<U, B>, [Iterable<B>]>
  ): Branched<U, B> {
    return new Branched(
      this._values.reduce((values, { value, branches }) => {
        const scope = branches;

        return mapper(value, branches.getOr([]))._values.reduce(
          (values, { value, branches }) => {
            if (scope.isNone() && branches.isSome()) {
              branches = unused(branches, this._values);
            } else {
              branches = narrow(branches, scope);
            }

            return merge(values, value, branches);
          },
          values
        );
      }, List.empty())
    );
  }

  public apply<U>(mapper: Branched<Mapper<T, U>, B>): Branched<U, B> {
    return this.flatMap((value) => mapper.map((mapper) => mapper(value)));
  }

  public reduce<U>(reducer: Reducer<T, U, [Iterable<B>]>, accumulator: U): U {
    return this._values.reduce(
      (accumulator, value) =>
        reducer(accumulator, value.value, value.branches.getOr([])),
      accumulator
    );
  }

  public some(predicate: Predicate<T, T, [Iterable<B>]>): boolean {
    for (const value of this._values) {
      if (predicate(value.value, value.branches.getOr([]))) {
        return true;
      }
    }

    return false;
  }

  public every(predicate: Predicate<T, T, [Iterable<B>]>): boolean {
    for (const value of this._values) {
      if (!predicate(value.value, value.branches.getOr([]))) {
        return false;
      }
    }

    return true;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Branched && Equatable.equals(value._values, this._values)
    );
  }

  public *[Symbol.iterator](): Iterator<[T, Iterable<B>]> {
    for (const value of this._values) {
      yield [value.value, value.branches.getOr([])];
    }
  }

  public toJSON(): Branched.JSON {
    return {
      values: [
        ...Iterable.map(this._values, ({ value, branches }) => {
          return {
            value: Serializable.toJSON(value),
            branches: branches.map((branches) => branches.toJSON()).getOr(null),
          };
        }),
      ],
    };
  }
}

export namespace Branched {
  export interface JSON {
    [key: string]: json.JSON;
    values: Array<{
      value: json.JSON;
      branches: List.JSON | null;
    }>;
  }

  export function isBranched<T, B = never>(
    value: unknown
  ): value is Branched<T, B> {
    return value instanceof Branched;
  }

  export function traverse<T, U, B>(
    values: Iterable<T>,
    mapper: Mapper<T, Branched<U, B>>
  ): Branched<Iterable<U>, B> {
    return Iterable.reduce(
      values,
      (values, value) =>
        mapper(value).flatMap((value) =>
          values.map((values) => values.append(value))
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

class Value<T, B> implements Equatable {
  public static of<T, B>(
    value: T,
    branches: Option<List<B>> = None
  ): Value<T, B> {
    return new Value(value, branches);
  }

  public readonly value: T;
  public readonly branches: Option<List<B>>;

  private constructor(value: T, branches: Option<List<B>>) {
    this.value = value;
    this.branches = branches;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Value &&
      Equatable.equals(value.value, this.value) &&
      Equatable.equals(value.branches, this.branches)
    );
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
