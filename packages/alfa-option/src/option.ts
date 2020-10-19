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
import { Refinement } from "@siteimprove/alfa-refinement";
import { Thunk } from "@siteimprove/alfa-thunk";

import { None } from "./none";
import { Some } from "./some";

export interface Option<T>
  extends Functor<T>,
    Monad<T>,
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
  reduce<U>(reducer: Reducer<T, U>, accumulator: U): U;
  apply<U>(mapper: Option<Mapper<T, U>>): Option<U>;
  filter<U extends T>(refinement: Refinement<T, U>): Option<U>;
  filter(predicate: Predicate<T>): Option<T>;
  reject<U extends T>(refinement: Refinement<T, U>): Option<Exclude<T, U>>;
  reject(predicate: Predicate<T>): Option<T>;
  includes(value: T): boolean;
  some(predicate: Predicate<T>): boolean;
  none(predicate: Predicate<T>): boolean;
  every(predicate: Predicate<T>): boolean;
  and<U>(option: Option<U>): Option<U>;
  andThen<U>(option: Mapper<T, Option<U>>): Option<U>;
  or<U>(option: Option<U>): Option<T | U>;
  orElse<U>(option: Thunk<Option<U>>): Option<T | U>;
  get(): T;
  getOr<U>(value: U): T | U;
  getOrElse<U>(value: Thunk<U>): T | U;
  toArray(): Array<T>;
  toJSON(): Option.JSON;
}

export namespace Option {
  export type Maybe<T> = T | Option<T>;

  export type JSON = Some.JSON | None.JSON;

  export function isOption<T>(value: unknown): value is Option<T> {
    return Some.isSome(value) || value === None;
  }

  export function of<T>(value: T): Option<T> {
    return Some.of(value);
  }

  export function empty<T>(): Option<T> {
    return None;
  }

  export function flatten<T>(option: Option<Option<T>>): Option<T> {
    return option.flatMap((option) => option);
  }

  export function from<T>(value: T | null | undefined): Option<NonNullable<T>> {
    return value === null || value === undefined ? None : Some.of(value!);
  }
}
