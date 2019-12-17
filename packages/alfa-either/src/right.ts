import { Equatable } from "@siteimprove/alfa-equatable";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Reducer } from "@siteimprove/alfa-reducer";

import { Either } from "./either";
import { Left } from "./left";

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

  public get(): R {
    return this._value;
  }

  public left(): None {
    return None;
  }

  public right(): Option<R> {
    return Option.of(this._value);
  }

  public either<T>(left: unknown, right: Mapper<R, T>): T {
    return right(this._value);
  }

  public map<T>(mapper: Mapper<R, T>): Either<T, T> {
    return new Right(mapper(this._value));
  }

  public flatMap<T>(mapper: Mapper<R, Either<T, T>>): Either<T, T> {
    return mapper(this._value);
  }

  public reduce<T>(reducer: Reducer<R, T>, accumulator: T): T {
    return reducer(accumulator, this._value);
  }

  public equals(value: unknown): value is Right<R> {
    return (
      value instanceof Right && Equatable.equals(value._value, this._value)
    );
  }

  public *[Symbol.iterator](): Iterator<R> {
    yield this._value;
  }

  public toJSON(): { right: R } {
    return { right: this._value };
  }
}

export namespace Right {
  export function isRight<R>(value: unknown): value is Right<R> {
    return value instanceof Right;
  }
}
