import { Equatable } from "@siteimprove/alfa-equatable";
import { Foldable } from "@siteimprove/alfa-foldable";
import { Functor } from "@siteimprove/alfa-functor";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Monad } from "@siteimprove/alfa-monad";
import { Option } from "@siteimprove/alfa-option";
import { Reducer } from "@siteimprove/alfa-reducer";
import { Thunk } from "@siteimprove/alfa-thunk";
import { Err } from "./err";
import { Ok } from "./ok";

export interface Result<T, E = T>
  extends Monad<T>,
    Functor<T>,
    Foldable<T>,
    Iterable<T>,
    Equatable,
    Serializable {
  isOk(): this is Ok<T>;
  isErr(): this is Err<E>;
  map<U>(mapper: Mapper<T, U>): Result<U, E>;
  mapErr<F>(mapper: Mapper<E, F>): Result<T, F>;
  mapOrElse<U>(ok: Mapper<T, U>, err: Mapper<E, U>): U;
  flatMap<U>(mapper: Mapper<T, Result<U, E>>): Result<U, E>;
  reduce<U>(reducer: Reducer<T, U>, accumulator: U): U;
  and<U>(result: Result<U, E>): Result<U, E>;
  andThen<U>(result: Mapper<T, Result<U, E>>): Result<U, E>;
  or<F>(result: Result<T, F>): Result<T, F>;
  orElse<F>(result: Thunk<Result<T, F>>): Result<T, F>;
  get(): T;
  getErr(): E;
  getOr<U>(value: U): T | U;
  getOrElse<U>(value: Thunk<U>): T | U;
  ok(): Option<T>;
  err(): Option<E>;
  toJSON(): Result.JSON;
}

export namespace Result {
  export type JSON = Ok.JSON | Err.JSON;

  export function of<T, E>(value: T): Result<T, E> {
    return Ok.of(value);
  }

  export function from<T>(
    thunk: Thunk<Promise<T>>
  ): Promise<Result<T, unknown>>;

  export function from<T>(thunk: Thunk<T>): Result<T, unknown>;

  export function from<T>(
    thunk: Thunk<T> | Thunk<Promise<T>>
  ): Result<T, unknown> | Promise<Result<T, unknown>> {
    let value: T | Promise<T>;
    try {
      value = thunk();
    } catch (error) {
      return Err.of(error);
    }

    if (value instanceof Promise) {
      return value
        .then((value) => Ok.of(value))
        .catch((error) => Err.of(error));
    }

    return Ok.of(value);
  }

  export function isResult<T, E>(value: unknown): value is Result<T, E> {
    return Ok.isOk(value) || Err.isErr(value);
  }
}
