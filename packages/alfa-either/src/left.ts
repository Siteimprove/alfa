import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Reducer } from "@siteimprove/alfa-reducer";

import * as json from "@siteimprove/alfa-json";

import { Either } from "./either";
import { Right } from "./right";

export class Left<L> implements Either<L, never> {
  public static of<L>(value: L): Left<L> {
    return new Left(value);
  }

  private readonly _value: L;

  private constructor(value: L) {
    this._value = value;
  }

  public isLeft(): this is Left<L> {
    return true;
  }

  public isRight(): this is Right<never> {
    return false;
  }

  public get(): L {
    return this._value;
  }

  public left(): Option<L> {
    return Option.of(this._value);
  }

  public right(): None {
    return None;
  }

  public either<T>(left: Mapper<L, T>): T {
    return left(this._value);
  }

  public map<T>(mapper: Mapper<L, T>): Either<T, T> {
    return new Left(mapper(this._value));
  }

  public flatMap<T>(mapper: Mapper<L, Either<T, T>>): Either<T, T> {
    return mapper(this._value);
  }

  public reduce<T>(reducer: Reducer<L, T>, accumulator: T): T {
    return reducer(accumulator, this._value);
  }

  public equals(value: unknown): value is this {
    return value instanceof Left && Equatable.equals(value._value, this._value);
  }

  public *[Symbol.iterator](): Iterator<L> {
    yield this._value;
  }

  public toJSON(): Left.JSON {
    return {
      type: "left",
      value: Serializable.toJSON(this._value)
    };
  }

  public toString(): string {
    return `Left { ${this._value} }`;
  }
}

export namespace Left {
  export interface JSON {
    [key: string]: json.JSON;
    type: "left";
    value: json.JSON;
  }

  export function isLeft<L>(value: unknown): value is Left<L> {
    return value instanceof Left;
  }
}
