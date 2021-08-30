import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Reducer } from "@siteimprove/alfa-reducer";

import * as json from "@siteimprove/alfa-json";

import { Either } from "./either";
import { Left } from "./left";

/**
 * @public
 */
export class Right<R> implements Either<never, R> {
  public static of<R>(value: R): Right<R> {
    return new Right(value);
  }

  private readonly _value: R;

  private constructor(value: R) {
    this._value = value;
  }

  public isLeft(): this is Left<never> {
    return false;
  }

  public isRight(): this is Right<R> {
    return true;
  }

  public map<T>(mapper: Mapper<R, T>): Right<T> {
    return new Right(mapper(this._value));
  }

  public apply<L, T>(mapper: Either<L, Mapper<R, T>>): Either<L, T> {
    return mapper.map((mapper) => mapper(this._value));
  }

  public flatMap<L, T>(mapper: Mapper<R, Either<L, T>>): Either<L, T> {
    return mapper(this._value);
  }

  public flatten<L, R>(this: Right<Either<L, R>>): Either<L, R> {
    return this._value;
  }

  public reduce<T>(reducer: Reducer<R, T>, accumulator: T): T {
    return reducer(accumulator, this._value);
  }

  public either<T>(left: unknown, right: Mapper<R, T>): T {
    return right(this._value);
  }

  public get(): R {
    return this._value;
  }

  public left(): None {
    return None;
  }

  public right(): Option<R> {
    return Option.of(this._value);
  }

  public equals<R>(value: Right<R>): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Right && Equatable.equals(value._value, this._value)
    );
  }

  public hash(hash: Hash): void {
    hash.writeBoolean(true).writeUnknown(this._value);
  }

  public *[Symbol.iterator](): Iterator<R> {
    yield this._value;
  }

  public toJSON(): Right.JSON<R> {
    return {
      type: "right",
      value: Serializable.toJSON(this._value),
    };
  }

  public toString(): string {
    return `Right { ${this._value} }`;
  }
}

/**
 * @public
 */
export namespace Right {
  export interface JSON<R> {
    [key: string]: json.JSON;
    type: "right";
    value: Serializable.ToJSON<R>;
  }

  export function isRight<R>(value: Iterable<R>): value is Right<R>;

  export function isRight<R>(value: unknown): value is Right<R>;

  export function isRight<R>(value: unknown): value is Right<R> {
    return value instanceof Right;
  }
}
