import type { Callback } from "@siteimprove/alfa-callback";
import { Equatable } from "@siteimprove/alfa-equatable";
import type { Hash } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import type { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import type { Refinement } from "@siteimprove/alfa-refinement";
import type { Thunk } from "@siteimprove/alfa-thunk";

import type * as json from "@siteimprove/alfa-json";

import type { Result } from "./result.js";

const { not, test } = Predicate;

/**
 * @public
 */
export class Err<E, O extends Serializable.Options = Serializable.Options>
  implements Result<never, E, O>
{
  public static of<E>(error: E): Err<E> {
    return new Err(error);
  }

  private readonly _error: E;

  private constructor(error: E) {
    this._error = error;
  }

  public isOk(): this is never {
    return false;
  }

  public isErr(): this is Err<E> {
    return true;
  }

  public map(): Err<E> {
    return this;
  }

  public mapErr<F>(mapper: Mapper<E, F>): Err<F> {
    return new Err(mapper(this._error));
  }

  public mapOrElse<U>(ok: unknown, err: Mapper<E, U>): U {
    return err(this._error);
  }

  public apply(): Err<E> {
    return this;
  }

  public flatMap(): Err<E> {
    return this;
  }

  public flatten<T, E>(this: Result<never, E>): Result<T, E> {
    return this;
  }

  public reduce<U>(reducer: unknown, accumulator: U): U {
    return accumulator;
  }

  public includes(): this is never {
    return false;
  }

  public includesErr(error: E): boolean {
    return Equatable.equals(this._error, error);
  }

  public some(): this is never {
    return false;
  }

  public someErr<F extends E>(refinement: Refinement<E, F>): this is Err<F>;

  public someErr(predicate: Predicate<E>): boolean;

  public someErr(predicate: Predicate<E>): boolean {
    return test(predicate, this._error);
  }

  public none(): this is Err<E> {
    return true;
  }

  public noneErr<F extends E>(
    refinement: Refinement<E, F>,
  ): this is Result<never, Exclude<E, F>>;

  public noneErr(predicate: Predicate<E>): boolean;

  public noneErr(predicate: Predicate<E>): boolean {
    return test(not(predicate), this._error);
  }

  public every(): this is Err<E> {
    return true;
  }

  public everyErr<F extends E>(
    refinement: Refinement<E, F>,
  ): this is Result<never, F>;

  public everyErr(predicate: Predicate<E>): boolean;

  public everyErr(predicate: Predicate<E>): boolean {
    return test(predicate, this._error);
  }

  public and(): Err<E> {
    return this;
  }

  public andThen(): Err<E> {
    return this;
  }

  public or<U, F>(result: Result<U, F>): Result<U, F> {
    return result;
  }

  public orElse<U, F>(result: Thunk<Result<U, F>>): Result<U, F> {
    return result();
  }

  /**
   * @internal
   */
  public getUnsafe(message = "Attempted to .getUnsafe() from Err"): never {
    throw new Error(message);
  }

  /**
   * @internal
   */
  public getErrUnsafe(): E {
    return this._error;
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

  public getErrOr(): E {
    return this._error;
  }

  public getErrOrElse(): E {
    return this._error;
  }

  public ok(): None {
    return None;
  }

  public err(): Option<E> {
    return Option.of(this._error);
  }

  public tee(): Err<E> {
    return this;
  }

  public teeErr(callback: Callback<E>): Err<E> {
    callback(this._error);
    return this;
  }

  public equals(value: unknown): value is this {
    return value instanceof Err && Equatable.equals(value._error, this._error);
  }

  public hash(hash: Hash): void {
    hash.writeBoolean(false).writeUnknown(this._error);
  }

  public *[Symbol.iterator]() {}

  public toJSON(options?: O): Err.JSON<E> {
    return {
      type: "err",
      error: Serializable.toJSON(this._error, options),
    };
  }

  public toString(): string {
    return `Err { ${this._error} }`;
  }
}

/**
 * @public
 */
export namespace Err {
  export interface JSON<E> {
    [key: string]: json.JSON;
    type: "err";
    error: Serializable.ToJSON<E>;
  }

  export function isErr<T, E>(value: Iterable<T>): value is Err<E>;

  export function isErr<E>(value: unknown): value is Err<E>;

  export function isErr<E>(value: unknown): value is Err<E> {
    return value instanceof Err;
  }
}
