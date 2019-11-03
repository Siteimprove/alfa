import { Equality } from "@siteimprove/alfa-equality";
import { Foldable } from "@siteimprove/alfa-foldable";
import { Functor } from "@siteimprove/alfa-functor";
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
    Equality<Option<T>> {
  isSome(): this is Some<T>;
  isNone(): this is None;
  map<U>(mapper: Mapper<T, U>): Option<U>;
  flatMap<U>(mapper: Mapper<T, Option<U>>): Option<U>;
  reduce<U>(reducer: Reducer<T, U>, accumulator: U): U;
  includes(value: T): boolean;
  filter<U extends T>(predicate: Predicate<T, U>): Option<U>;
  and<U>(option: Option<U>): Option<U>;
  andThen<U>(option: Mapper<T, Option<U>>): Option<U>;
  or<U>(option: Option<U>): Some<T> | Option<U>;
  orElse<U>(option: Thunk<Option<U>>): Some<T> | Option<U>;
  getOr<U>(value: U): T | U;
  getOrElse<U>(value: () => U): T | U;
  equals(value: unknown): value is Option<T>;
  toJSON(): { value: T } | {};
}

export namespace Option {
  export function from<T>(value: T | null | undefined): Option<NonNullable<T>> {
    return value === null || value === undefined ? None : Some.of(value!);
  }

  export function isSome<T>(value: unknown): value is Some<T> {
    return value instanceof Some;
  }

  export function isNone(value: unknown): value is None {
    return value === None;
  }

  export function isOption<T>(value: unknown): value is Option<T> {
    return isSome<T>(value) || isNone(value);
  }
}
