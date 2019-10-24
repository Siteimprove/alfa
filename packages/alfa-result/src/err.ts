import { Mapper } from "@siteimprove/alfa-mapper";
import { Thunk } from "@siteimprove/alfa-thunk";
import { Ok } from "./ok";
import { Result } from "./result";

export class Err<E> implements Result<never, E> {
  public static of<E>(error: E): Err<E> {
    return new Err(error);
  }

  private readonly error: E;

  private constructor(error: E) {
    this.error = error;
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
    return new Err(mapper(this.error));
  }

  public flatten<U, F>(): Result.Flattened<never, E, U, F>;

  public flatten(): this {
    return this;
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

  public getErr(): E {
    return this.error;
  }

  public getOr<U>(value: U): U {
    return value;
  }

  public getOrElse<U>(value: Thunk<U>): U {
    return value();
  }

  public toJSON(): { error: E } {
    return { error: this.error };
  }

  public toString(): string {
    return `Err { ${this.error} }`;
  }
}
