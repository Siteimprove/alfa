import { Callback } from "@siteimprove/alfa-callback";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Predicate } from "@siteimprove/alfa-predicate";
import { None, Option } from "@siteimprove/alfa-option";
import { Thunk } from "@siteimprove/alfa-thunk";

import * as json from "@siteimprove/alfa-json";

import { Ok } from "./ok";
import { Result } from "./result";

const { not, test } = Predicate;

/**
 * @public
 */
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

  public includes(): boolean {
    return false;
  }

  public includesErr(error: E): boolean {
    return Equatable.equals(this._error, error);
  }

  public some(): boolean {
    return false;
  }

  public someErr(predicate: Predicate<E>): boolean {
    return test(predicate, this._error);
  }

  public none(): boolean {
    return true;
  }

  public noneErr(predicate: Predicate<E>): boolean {
    return test(not(predicate), this._error);
  }

  public every(): boolean {
    return true;
  }

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

  public get(message = "Attempted to .get() from Err"): never {
    throw new Error(message);
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

  public toJSON(): Err.JSON<E> {
    return {
      type: "err",
      error: Serializable.toJSON(this._error),
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
