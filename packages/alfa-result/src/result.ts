import { Equality } from "@siteimprove/alfa-compare";
import { Functor } from "@siteimprove/alfa-functor";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Monad } from "@siteimprove/alfa-monad";
import { Reducer } from "@siteimprove/alfa-reducer";
import { Thunk } from "@siteimprove/alfa-thunk";
import { Err } from "./err";
import { Ok } from "./ok";

export interface Result<T, E> extends Monad<T>, Functor<T>, Equality {
  isOk(): this is Ok<T>;
  isErr(): this is Err<E>;
  map<U>(mapper: Mapper<T, U>): Result<U, E>;
  mapErr<F>(mapper: Mapper<E, F>): Result<T, F>;
  flatMap<U>(mapper: Mapper<T, Result<U, E>>): Result<U, E>;
  reduce<U>(reducer: Reducer<T, U>, accumulator: U): U;
  and<U>(result: Result<U, E>): Result<U, E>;
  andThen<U>(result: Mapper<T, Result<U, E>>): Result<U, E>;
  or<F>(result: Result<T, F>): Result<T, F>;
  orElse<F>(result: Thunk<Result<T, F>>): Result<T, F>;
  getOr<U>(value: U): T | U;
  getOrElse<U>(value: Thunk<U>): T | U;
  equals(value: unknown): value is Result<T, E>;
  toJSON(): { value: T } | { error: E };
}

export namespace Result {
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
      return value.then(value => Ok.of(value)).catch(error => Err.of(error));
    }

    return Ok.of(value);
  }

  export function isOk<T>(value: unknown): value is Ok<T> {
    return value instanceof Ok;
  }

  export function isErr<E>(value: unknown): value is Err<E> {
    return value instanceof Err;
  }

  export function isResult<T, E>(value: unknown): value is Result<T, E> {
    return isOk<T>(value) || isErr<T>(value);
  }
}
