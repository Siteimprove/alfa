export type Ok<T> = Exclude<T, Error>;

export function Ok<T>(value: Ok<T>): Ok<T> {
  return value;
}

export type Err<E extends Error> = E;

export function Err<E extends Error>(value: E): Err<E> {
  return value;
}

export type Result<T, E extends Error> = Ok<T> | Err<E>;

export function Result<T, E extends Error>(value: Result<T, E>): Result<T, E> {
  return Result.isErr(value) ? Err(value) : Ok(value);
}

export namespace Result {
  export function isOk<T, E extends Error>(
    result: Result<T, E>
  ): result is Ok<T> {
    return result instanceof Error === false;
  }

  export function isErr<T, E extends Error>(
    result: Result<T, E>
  ): result is Err<E> {
    return result instanceof Error;
  }
}
