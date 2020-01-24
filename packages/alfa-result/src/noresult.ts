import { None } from "@siteimprove/alfa-option";
import { Thunk } from "@siteimprove/alfa-thunk";
import * as json from "@siteimprove/alfa-json";

import { Ok } from "./ok";
import { Err } from "./err";
import { Result } from "./result";

export class NoResult implements Result<never, never> {
  public isOk(): this is Ok<never> {
    return false;
  }

  public isErr(): this is Err<never> {
    return false;
  }

  public isNoResult(): this is NoResult {
    return true;
  }

  public map(): this {
    return this;
  }

  public mapErr(): this {
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

  public get(): never {
    throw new Error("Attempted to .get() from None");
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

  public err(): None {
    return None;
  }

  public equals(value: unknown): value is this {
    return value instanceof NoResult;
  }

  public *[Symbol.iterator]() {}

  public toJSON(): NoResult.JSON {
    return {};
  }

  public toString(): string {
    return `No result`;
  }
}
export namespace NoResult {
  export function isNoResult(value: unknown): value is NoResult {
    return value instanceof NoResult;
  }

  export interface JSON {
    [key: string]: json.JSON;
  }
}

export const Noresult: NoResult = new NoResult();
