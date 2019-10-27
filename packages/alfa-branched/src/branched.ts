import { List, Seq, Set } from "@siteimprove/alfa-collection";
import { Equality } from "@siteimprove/alfa-compare";
import { Functor } from "@siteimprove/alfa-functor";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Monad } from "@siteimprove/alfa-monad";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Reducer } from "@siteimprove/alfa-reducer";

export class Branched<T, B> implements Monad<T>, Functor<T> {
  public static of<T, B>(value: T, ...branches: Array<B>): Branched<T, B> {
    return new Branched<T, B>(
      List.of(Value.of(value, branches.length === 0 ? None : Some.of(branches)))
    );
  }

  private readonly values: List<Value<T, B>>;

  private constructor(values: List<Value<T, B>>) {
    this.values = values;
  }

  public branch(value: T, ...branches: Array<B>): Branched<T, B> {
    return new Branched(
      merge(
        this.values,
        value,
        branches.length === 0 ? None : Some.of(Set(branches))
      )
    );
  }

  public map<U>(mapper: Mapper<T, U, [Option<Iterable<B>>]>): Branched<U, B> {
    return new Branched(
      this.values.map(({ value, branches }) => {
        return {
          value: mapper(value, branches),
          branches
        };
      })
    );
  }

  public flatMap<U>(
    mapper: Mapper<T, Branched<U, B>, [Option<Iterable<B>>]>
  ): Branched<U, B> {
    return new Branched(
      this.values.reduce((values, { value, branches }) => {
        const scope = branches;

        return mapper(value, branches).values.reduce(
          (values, { value, branches }) => {
            if (scope.isNone() && branches.isSome()) {
              branches = unused(branches, this.values);
            } else {
              branches = narrow(branches, scope);
            }

            return merge(values, value, branches);
          },
          values
        );
      }, List<Value<U, B>>())
    );
  }

  public reduce<U>(
    reducer: Reducer<T, U, [Option<Iterable<B>>]>,
    accumulator: U
  ): U {
    return this.values.reduce(
      (accumulator, value) => reducer(accumulator, value.value, value.branches),
      accumulator
    );
  }

  public toJSON() {
    return {
      values: this.values
        .map(({ value, branches }) => {
          return {
            value,
            branches: branches.map(branches => branches.toJSON()).getOr(null)
          };
        })
        .toJSON()
    };
  }
}

export namespace Branched {
  export function traverse<T, U, B>(
    values: Iterable<T>,
    mapper: Mapper<T, Branched<U, B>>
  ): Branched<Iterable<U>, B> {
    return Seq(values).reduce(
      (values, value) =>
        values.flatMap(values =>
          mapper(value).map(value => values.push(value))
        ),
      Branched.of<List<U>, B>(List())
    );
  }

  export function sequence<T, B>(
    values: Iterable<Branched<T, B>>
  ): Branched<Iterable<T>, B> {
    return traverse(values, value => value);
  }

  export function isBranched<T, B>(value: unknown): value is Branched<T, B> {
    return value instanceof Branched;
  }
}

class Value<T, B> {
  public static of<T, B>(
    value: T,
    branches: Option<Iterable<B>> = None
  ): Value<T, B> {
    return new Value(value, branches.map<Set<B>>(Set));
  }

  public readonly value: T;
  public readonly branches: Option<Set<B>>;

  private constructor(value: T, branches: Option<Set<B>>) {
    this.value = value;
    this.branches = branches;
  }
}

function merge<T, B>(
  values: List<Value<T, B>>,
  value: T,
  branches: Option<Set<B>>
): List<Value<T, B>> {
  branches = Option.from(
    values.find(existing => Equality.equals(existing.value, value))
  )
    .map(existing =>
      existing.branches.flatMap(left =>
        branches.map(right => left.concat(right))
      )
    )
    .getOr(branches);

  return deduplicate(values, value, branches).push(Value.of(value, branches));
}

function deduplicate<T, B>(
  values: List<Value<T, B>>,
  value: T,
  branches: Option<Set<B>>
): List<Value<T, B>> {
  return values.reduce((values, existing) => {
    if (Equality.equals(existing.value, value)) {
      return values;
    }

    if (existing.branches.isNone()) {
      return branches.isNone() ? values : values.push(existing);
    }

    return existing.branches.reduce((values, existingBranches) => {
      const deduplicated = branches.reduce(
        (existing, branches) => existing.subtract(branches),
        existingBranches
      );

      if (deduplicated.count() === 0) {
        return values;
      }

      return values.push(Value.of(existing.value, Some.of(deduplicated)));
    }, values);
  }, List<Value<T, B>>());
}

function narrow<T, B>(
  branches: Option<Set<B>>,
  scope: Option<Set<B>>
): Option<Set<B>> {
  return scope.map(scope =>
    branches.reduce((scope, branches) => scope.intersect(branches), scope)
  );
}

function unused<T, B>(
  branches: Option<Set<B>>,
  values: List<Value<T, B>>
): Option<Set<B>> {
  return values.reduce(
    (branches, value) =>
      value.branches
        .flatMap(existing =>
          branches.map(branches => branches.subtract(existing))
        )
        .or(branches),
    branches
  );
}
