import { Callback } from "@siteimprove/alfa-callback";
import { Equatable } from "@siteimprove/alfa-equatable";
import type { Foldable } from "@siteimprove/alfa-foldable";
import { Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import type { Mapper } from "@siteimprove/alfa-mapper";
import type { Monad } from "@siteimprove/alfa-monad";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Thunk } from "@siteimprove/alfa-thunk";

import { Err } from "./err.js";
import { Ok } from "./ok.js";

/**
 * @public
 */
export interface Result<
  T,
  E = T,
  O extends Serializable.Options = Serializable.Options,
> extends Monad<T>,
    Foldable<T>,
    Iterable<T>,
    Equatable,
    Hashable,
    Serializable<Result.JSON<T, E>, O> {
  isOk(): this is Ok<T>;
  isErr(): this is Err<E>;
  map<U>(mapper: Mapper<T, U>): Result<U, E>;
  mapErr<F>(mapper: Mapper<E, F>): Result<T, F>;
  mapOrElse<U>(ok: Mapper<T, U>, err: Mapper<E, U>): U;
  apply<U>(mapper: Result<Mapper<T, U>, E>): Result<U, E>;
  flatMap<U>(mapper: Mapper<T, Result<U, E>>): Result<U, E>;
  flatten<T, E>(this: Result<Result<T, E>, E>): Result<T, E>;
  reduce<U>(reducer: Reducer<T, U>, accumulator: U): U;
  includes(value: T): boolean;
  includesErr(error: E): boolean;
  some<U extends T>(refinement: Refinement<T, U>): this is Ok<U>;
  some(predicate: Predicate<T>): boolean;
  someErr<F extends E>(refinement: Refinement<E, F>): this is Err<F>;
  someErr(predicate: Predicate<E>): boolean;
  none<U extends T>(
    refinement: Refinement<T, U>,
  ): this is Result<Exclude<T, U>, E>;
  none(predicate: Predicate<T>): boolean;
  noneErr<F extends E>(
    refinement: Refinement<E, F>,
  ): this is Result<T, Exclude<E, F>>;
  noneErr(predicate: Predicate<E>): boolean;
  every<U extends T>(refinement: Refinement<T, U>): this is Result<U, E>;
  every(predicate: Predicate<T>): boolean;
  everyErr<F extends E>(refinement: Refinement<E, F>): this is Result<T, F>;
  everyErr(predicate: Predicate<E>): boolean;
  and<U, F>(result: Result<U, F>): Result<U, E | F>;
  andThen<U, F>(result: Mapper<T, Result<U, F>>): Result<U, E | F>;
  or<U, F>(result: Result<U, F>): Result<T | U, F>;
  orElse<U, F>(result: Thunk<Result<U, F>>): Result<T | U, F>;
  /**
   * This may throw an exception. Use only when you can provide an external
   * guarantee that it won't be used on Err. E.g. in tests, or when some
   * condition exists that TypeScript cannot see (document it!)
   *
   * @internal
   */
  getUnsafe(message?: string): T;
  /**
   * This may throw an exception. Use only when you can provide an external
   * guarantee that it won't be used on Ok. E.g. in tests, or when some
   * condition exists that TypeScript cannot see (document it!)
   *
   * @internal
   */
  getErrUnsafe(message?: string): E;
  getOr<U>(value: U): T | U;
  getOrElse<U>(value: Thunk<U>): T | U;
  getErrOr<F>(error: F): E | F;
  getErrOrElse<F>(error: Thunk<F>): E | F;
  ok(): Option<T>;
  err(): Option<E>;
  tee(callback: Callback<T>): Result<T, E>;
  teeErr(callback: Callback<E>): Result<T, E>;
  toJSON(options?: O): Result.JSON<T, E>;
}

/**
 * @public
 */
export namespace Result {
  export type JSON<T, E = T> = Ok.JSON<T> | Err.JSON<E>;

  export function isResult<T, E>(value: Iterable<T>): value is Result<T, E>;

  export function isResult<T, E>(value: unknown): value is Result<T, E>;

  export function isResult<T, E>(value: unknown): value is Result<T, E> {
    return isOk(value) || isErr(value);
  }

  export function isOk<T>(value: Iterable<T>): value is Ok<T>;

  export function isOk<T>(value: unknown): value is Ok<T>;

  export function isOk<T>(value: unknown): value is Ok<T> {
    return Ok.isOk(value);
  }

  export function isErr<T, E>(value: Iterable<T>): value is Err<E>;

  export function isErr<E>(value: unknown): value is Err<E>;

  export function isErr<E>(value: unknown): value is Err<E> {
    return Err.isErr(value);
  }

  export function of<T, E>(value: T): Result<T, E> {
    return Ok.of(value);
  }

  export function from<T, E = unknown>(
    thunk: Thunk<Promise<T>>,
  ): Promise<Result<T, E>>;

  export function from<T, E = unknown>(thunk: Thunk<T>): Result<T, E>;

  export function from<T, E = unknown>(
    thunk: Thunk<T> | Thunk<Promise<T>>,
  ): Result<T, E> | Promise<Result<T, E>> {
    let value: T | Promise<T>;
    try {
      value = thunk();
    } catch (error) {
      return Err.of(error as E);
    }

    if (value instanceof Promise) {
      return value
        .then((value) => Ok.of(value))
        .catch((error) => Err.of(error));
    }

    return Ok.of(value);
  }
}
