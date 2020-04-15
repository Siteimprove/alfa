import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Thunk } from "@siteimprove/alfa-thunk";
import * as json from "@siteimprove/alfa-json";

import { Ok } from "./ok";
import { Result } from "./result";

export class Err<E> implements Result<never, E> {
  public static of<E>(error: E): Err<E> {
    return new Err(error);
  }

  private readonly _error: E;

  private constructor(error: E) {
    this._error = error;
  }

  public isOk(): this is Ok<never> {
    return false;
  }

  public isErr(): this is Err<E> {
    return true;
  }

  public map(): this {
    return this;
  }

  public mapErr<F>(mapper: Mapper<E, F>): Err<F> {
    return new Err(mapper(this._error));
  }

  public mapOrElse<T, U>(ok: Mapper<T, U>, err: Mapper<E, U>): U {
    return err(this._error);
  }

  public flatMap(): this {
    return this;
  }

  public reduce<U>(reducer: unknown, accumulator: U): U {
    return accumulator;
  }

  public and(): this {
    return this;
  }

  public andThen(): this {
    return this;
  }

  public or<U, F>(result: Result<U, F>): Result<U, F> {
    return result;
  }

  public orElse<U, F>(result: Thunk<Result<U, F>>): Result<U, F> {
    return result();
  }

  public get(): never {
    throw new Error("Attempted to .get() from Err");
  }

  public getErr(): E {
    return this._error;
  }

  public getOr<U>(value: U): U {
    return value;
  }

  public getOrElse<U>(value: Thunk<U>): U {
    return value();
  }

  public ok(): None {
    return None;
  }

  public err(): Option<E> {
    return Option.of(this._error);
  }

  public equals(value: unknown): value is this {
    return value instanceof Err && Equatable.equals(value._error, this._error);
  }

  public *[Symbol.iterator]() {}

  public toJSON(): Err.JSON {
    return {
      type: "err",
      error: Serializable.toJSON(this._error),
    };
  }

  public toString(): string {
    return `Err { ${this._error} }`;
  }
}

export namespace Err {
  export function isErr<E>(value: unknown): value is Err<E> {
    return value instanceof Err;
  }

  export interface JSON {
    [key: string]: json.JSON;
    type: "err";
    error: json.JSON;
  }
}
