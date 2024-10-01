import type { Callback } from "@siteimprove/alfa-callback";
import type { Comparable, Comparison } from "@siteimprove/alfa-comparable";
import { type Comparer } from "@siteimprove/alfa-comparable";
import type { Equatable } from "@siteimprove/alfa-equatable";
import type { Foldable } from "@siteimprove/alfa-foldable";
import type { Hashable } from "@siteimprove/alfa-hash";
import type { Serializable } from "@siteimprove/alfa-json";
import type { Mapper } from "@siteimprove/alfa-mapper";
import type { Monad } from "@siteimprove/alfa-monad";
import type { Predicate } from "@siteimprove/alfa-predicate";
import type { Reducer } from "@siteimprove/alfa-reducer";
import type { Refinement } from "@siteimprove/alfa-refinement";
import type { Thunk } from "@siteimprove/alfa-thunk";

import { None } from "./none.js";
import { Some } from "./some.js";

/**
 * @public
 */
export interface Option<T>
  extends Monad<T>,
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
  includes(value: T): boolean;
  some<U extends T>(refinement: Refinement<T, U>): this is Some<U>;
  some(predicate: Predicate<T>): boolean;
  none<U extends T>(
    refinement: Refinement<T, U>,
  ): this is Option<Exclude<T, U>>;
  none(predicate: Predicate<T>): boolean;
  every<U extends T>(refinement: Refinement<T, U>): this is Option<U>;
  every(predicate: Predicate<T>): boolean;
  and<U>(option: Option<U>): Option<U>;
  andThen<U>(option: Mapper<T, Option<U>>): Option<U>;
  or<U>(option: Option<U>): Option<T | U>;
  orElse<U>(option: Thunk<Option<U>>): Option<T | U>;
  /**
   * This may throw an exception. Use only when you can provide an external
   * guarantee that it won't be used on None. E.g. in tests, or when some
   * condition exists that TypeScript cannot see (document it!)
   *
   * @internal
   */
  getUnsafe(message?: string): T;
  getOr<U>(value: U): T | U;
  getOrElse<U>(value: Thunk<U>): T | U;
  tee(callback: Callback<T>): Option<T>;
  compare<T>(this: Option<Comparable<T>>, option: Option<T>): Comparison;
  compareWith<U = T>(option: Option<U>, comparer: Comparer<T, U>): Comparison;
  toArray(): Array<T>;
  toJSON(options?: Serializable.Options): Option.JSON<T>;
}

/**
 * @public
 */
export namespace Option {
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

  export function of<T>(value: T): Some<T> {
    return Some.of(value);
  }

  export function empty<T>(): None {
    return None;
  }

  export function from<T>(value: T | null | undefined): Option<NonNullable<T>> {
    return value === null || value === undefined ? None : Some.of(value!);
  }

  export function conditional<T>(value: T, predicate: Predicate<T>): Option<T> {
    return predicate(value) ? Some.of(value) : None;
  }
}
