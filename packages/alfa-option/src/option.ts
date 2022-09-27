import { Applicative } from "@siteimprove/alfa-applicative";
import { Callback } from "@siteimprove/alfa-callback";
import { Comparable, Comparison, Comparer } from "@siteimprove/alfa-comparable";
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

/**
 * @public
 */
export interface Option<T>
  extends Functor<T>,
    Applicative<T>,
    Monad<T>,
    Foldable<T>,
    Iterable<T>,
    Equatable,
    Hashable,
    Serializable<Option.JSON<T>> {
  isSome(): this is Some<T>;
  isNone(): this is None;
  map<U>(mapper: Mapper<T, U>): Option<U>;
  forEach(mapper: Mapper<T, void>): void;
  apply<U>(mapper: Option<Mapper<T, U>>): Option<U>;
  flatMap<U>(mapper: Mapper<T, Option<U>>): Option<U>;
  flatten<T>(this: Option<Option<T>>): Option<T>;
  reduce<U>(reducer: Reducer<T, U>, accumulator: U): U;
  filter<U extends T>(refinement: Refinement<T, U>): Option<U>;
  filter(predicate: Predicate<T>): Option<T>;
  reject<U extends T>(refinement: Refinement<T, U>): Option<Exclude<T, U>>;
  reject(predicate: Predicate<T>): Option<T>;
  includes(value: T): this is Some<T>;
  some<U extends T>(refinement: Refinement<T, U>): this is Some<U>;
  some(predicate: Predicate<T>): this is Some<T>;
  none<U extends T>(
    refinement: Refinement<T, U>
  ): this is Option<Exclude<T, U>>;
  none(predicate: Predicate<T>): boolean;
  every<U extends T>(refinement: Refinement<T, U>): this is Option<U>;
  every(predicate: Predicate<T>): boolean;
  and<U>(option: Option<U>): Option<U>;
  andThen<U>(option: Mapper<T, Option<U>>): Option<U>;
  or<U>(option: Option<U>): Option<T | U>;
  orElse<U>(option: Thunk<Option<U>>): Option<T | U>;
  get(message?: string): T;
  getOr<U>(value: U): T | U;
  getOrElse<U>(value: Thunk<U>): T | U;
  tee(callback: Callback<T>): Option<T>;
  compare<T>(this: Option<Comparable<T>>, option: Option<T>): Comparison;
  compareWith<U = T>(option: Option<U>, comparer: Comparer<T, U>): Comparison;
  toArray(): Array<T>;
  toJSON(): Option.JSON<T>;
}

/**
 * @public
 */
export namespace Option {
  export type Maybe<T> = T | Option<T>;

  export type JSON<T> = Some.JSON<T> | None.JSON;

  export function isOption<T>(value: Iterable<T>): value is Option<T>;

  export function isOption<T>(value: unknown): value is Option<T>;

  export function isOption<T>(value: unknown): value is Option<T> {
    return isSome(value) || isNone(value);
  }

  export function isSome<T>(value: Iterable<T>): value is Some<T>;

  export function isSome<T>(value: unknown): value is Some<T>;

  export function isSome<T>(value: unknown): value is Some<T> {
    return Some.isSome(value);
  }

  export function isNone<T>(value: Iterable<T>): value is None;

  export function isNone(value: unknown): value is None;

  export function isNone(value: unknown): value is None {
    return value === None;
  }

  export function of<T>(value: T): Option<T> {
    return Some.of(value);
  }

  export function empty<T>(): Option<T> {
    return None;
  }

  export function from<T>(value: T | null | undefined): Option<NonNullable<T>> {
    return value === null || value === undefined ? None : Some.of(value!);
  }
}
