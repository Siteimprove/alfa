import { Equality } from "@siteimprove/alfa-equality";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Reducer } from "@siteimprove/alfa-reducer";
import { Err } from "./err";
import { Result } from "./result";

export class Ok<T> implements Result<T, never> {
  public static of<T>(value: T): Ok<T> {
    return new Ok(value);
  }

  private readonly value: T;

  private constructor(value: T) {
    this.value = value;
  }

  public isOk(): this is Ok<T> {
    return true;
  }

  public isErr(): this is Err<never> {
    return false;
  }

  public map<U>(mapper: Mapper<T, U>): Ok<U> {
    return new Ok(mapper(this.value));
  }

  public mapErr(): this {
    return this;
  }

  public flatMap<U, F>(mapper: Mapper<T, Result<U, F>>): Result<U, F> {
    return mapper(this.value);
  }

  public reduce<U>(reducer: Reducer<T, U>, accumulator: U): U {
    return reducer(accumulator, this.value);
  }

  public and<U, F>(result: Result<U, F>): Result<U, F> {
    return result;
  }

  public andThen<U, F>(result: Mapper<T, Result<U, F>>): Result<U, F> {
    return result(this.value);
  }

  public or(): this {
    return this;
  }

  public orElse(): this {
    return this;
  }

  public get(): T {
    return this.value;
  }

  public getOr(): T {
    return this.value;
  }

  public getOrElse(): T {
    return this.value;
  }

  public equals(value: unknown): value is Ok<T> {
    return value instanceof Ok && Equality.equals(value.value, this.value);
  }

  public *[Symbol.iterator]() {
    yield this.value;
  }

  public toJSON(): { value: T } {
    return { value: this.value };
  }

  public toString(): string {
    return `Ok { ${this.value} }`;
  }
}
