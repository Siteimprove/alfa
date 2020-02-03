import { Applicative } from "@siteimprove/alfa-applicative";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Foldable } from "@siteimprove/alfa-foldable";
import { Functor } from "@siteimprove/alfa-functor";
import { Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Monad } from "@siteimprove/alfa-monad";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";
import { Thunk } from "@siteimprove/alfa-thunk";

import { None } from "./none";
import { Some } from "./some";

export interface Option<T>
  extends Monad<T>,
    Functor<T>,
    Foldable<T>,
    Applicative<T>,
    Iterable<T>,
    Equatable,
    Hashable,
    Serializable {
  isSome(): this is Some<T>;
  isNone(): this is None;
  map<U>(mapper: Mapper<T, U>): Option<U>;
  flatMap<U>(mapper: Mapper<T, Option<U>>): Option<U>;
  apply<U>(mapper: Option<Mapper<T, U>>): Option<U>;
  reduce<U>(reducer: Reducer<T, U>, accumulator: U): U;
  includes(value: T): boolean;
  some(predicate: Predicate<T>): boolean;
  every(predicate: Predicate<T>): boolean;
  filter<U extends T>(predicate: Predicate<T, U>): Option<U>;
  and<U>(option: Option<U>): Option<U>;
  andThen<U>(option: Mapper<T, Option<U>>): Option<U>;
  or<U>(option: Option<U>): Option<T | U>;
  orElse<U>(option: Thunk<Option<U>>): Option<T | U>;
  get(): T;
  getOr<U>(value: U): T | U;
  getOrElse<U>(value: Thunk<U>): T | U;
  toJSON(): Option.JSON;
}

export namespace Option {
  export type Maybe<T> = T | Option<T>;

  export type JSON = Some.JSON | None.JSON;

  export function of<T>(value: T): Option<T> {
    return Some.of(value);
  }

  export function from<T>(value: T | null | undefined): Option<NonNullable<T>> {
    return value === null || value === undefined ? None : Some.of(value!);
  }

  export function flatten<T>(value: Option<Option<T>>): Option<T> {
    return value.flatMap(value => value);
  }

  export function isOption<T>(value: unknown): value is Option<T> {
    return Some.isSome(value) || value === None;
  }
}
