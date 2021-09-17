import { Callback } from "@siteimprove/alfa-callback";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Predicate } from "@siteimprove/alfa-predicate";
import { None, Option } from "@siteimprove/alfa-option";
import { Reducer } from "@siteimprove/alfa-reducer";

import * as json from "@siteimprove/alfa-json";

import { Err } from "./err";
import { Result } from "./result";

const { not, test } = Predicate;

/**
 * @public
 */
export class Ok<T> implements Result<T, never> {
  public static of<T>(value: T): Ok<T> {
    return new Ok(value);
  }

  private readonly _value: T;

  private constructor(value: T) {
    this._value = value;
  }

  public isOk(): this is Ok<T> {
    return true;
  }

  public isErr(): this is Err<never> {
    return false;
  }

  public map<U>(mapper: Mapper<T, U>): Ok<U> {
    return new Ok(mapper(this._value));
  }

  public mapErr(): Ok<T> {
    return this;
  }

  public mapOrElse<U>(ok: Mapper<T, U>): U {
    return ok(this._value);
  }

  public apply<E, U>(mapper: Result<Mapper<T, U>, E>): Result<U, E> {
    return mapper.map((mapper) => mapper(this._value));
  }

  public flatMap<U, F>(mapper: Mapper<T, Result<U, F>>): Result<U, F> {
    return mapper(this._value);
  }

  public flatten<T, E>(this: Ok<Result<T, E>>): Result<T, E> {
    return this._value;
  }

  public reduce<U>(reducer: Reducer<T, U>, accumulator: U): U {
    return reducer(accumulator, this._value);
  }

  public includes(value: T): boolean {
    return Equatable.equals(this._value, value);
  }

  public includesErr(): boolean {
    return false;
  }

  public some(predicate: Predicate<T>): boolean {
    return test(predicate, this._value);
  }

  public someErr(): boolean {
    return false;
  }

  public none(predicate: Predicate<T>): boolean {
    return test(not(predicate), this._value);
  }

  public noneErr(): boolean {
    return true;
  }

  public every(predicate: Predicate<T>): boolean {
    return test(predicate, this._value);
  }

  public everyErr(): boolean {
    return true;
  }

  public and<U, F>(result: Result<U, F>): Result<U, F> {
    return result;
  }

  public andThen<U, F>(result: Mapper<T, Result<U, F>>): Result<U, F> {
    return result(this._value);
  }

  public or(): Ok<T> {
    return this;
  }

  public orElse(): Ok<T> {
    return this;
  }

  public get(): T {
    return this._value;
  }

  public getErr(message = "Attempted to .getErr() from Ok"): never {
    throw new Error(message);
  }

  public getOr(): T {
    return this._value;
  }

  public getOrElse(): T {
    return this._value;
  }

  public ok(): Option<T> {
    return Option.of(this._value);
  }

  public err(): None {
    return None;
  }

  public tee(callback: Callback<T>): Ok<T> {
    callback(this._value);
    return this;
  }

  public teeErr(): Ok<T> {
    return this;
  }

  public equals(value: unknown): value is this {
    return value instanceof Ok && Equatable.equals(value._value, this._value);
  }

  public hash(hash: Hash): void {
    hash.writeBoolean(true).writeUnknown(this._value);
  }

  public *[Symbol.iterator]() {
    yield this._value;
  }

  public toJSON(): Ok.JSON<T> {
    return {
      type: "ok",
      value: Serializable.toJSON(this._value),
    };
  }

  public toString(): string {
    return `Ok { ${this._value} }`;
  }
}

/**
 * @public
 */
export namespace Ok {
  export interface JSON<T> {
    [key: string]: json.JSON;
    type: "ok";
    value: Serializable.ToJSON<T>;
  }

  export function isOk<T>(value: Iterable<T>): value is Ok<T>;

  export function isOk<T>(value: unknown): value is Ok<T>;

  export function isOk<T>(value: unknown): value is Ok<T> {
    return value instanceof Ok;
  }
}
