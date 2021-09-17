import { Comparable, Comparison } from "@siteimprove/alfa-comparable";
import { Hash } from "@siteimprove/alfa-hash";
import { Thunk } from "@siteimprove/alfa-thunk";

import * as json from "@siteimprove/alfa-json";

import { Option } from "./option";
import { Some } from "./some";

const { compareComparable } = Comparable;

/**
 * @public
 */
export interface None extends Option<never> {}

/**
 * @public
 */
export const None: None = new (class None {
  public isSome(): this is Some<never> {
    return false;
  }

  public isNone(): this is None {
    return true;
  }

  public map(): None {
    return this;
  }

  public apply(): None {
    return this;
  }

  public flatMap(): None {
    return this;
  }

  public flatten(): None {
    return this;
  }

  public reduce<U>(reducer: unknown, accumulator: U): U {
    return accumulator;
  }

  public filter(): None {
    return this;
  }

  public reject(): None {
    return this;
  }

  public includes(): boolean {
    return false;
  }

  public some(): boolean {
    return false;
  }

  public none(): boolean {
    return true;
  }

  public every(): boolean {
    return true;
  }

  public and(): None {
    return this;
  }

  public andThen(): None {
    return this;
  }

  public or<U>(option: Option<U>): Option<U> {
    return option;
  }

  public orElse<U>(option: Thunk<Option<U>>): Option<U> {
    return option();
  }

  public get(message = "Attempted to .get() from None"): never {
    throw new Error(message);
  }

  public getOr<U>(value: U): U {
    return value;
  }

  public getOrElse<U>(value: Thunk<U>): U {
    return value();
  }

  public tee(): None {
    return this;
  }

  public compare<T>(
    this: Option<Comparable<T>>,
    option: Option<T>
  ): Comparison {
    return this.compareWith(option, compareComparable);
  }

  public compareWith<T>(option: Option<T>): Comparison {
    return option.isNone() ? Comparison.Equal : Comparison.Less;
  }

  public equals(value: unknown): value is this {
    return value instanceof None;
  }

  public hash(hash: Hash): void {
    hash.writeBoolean(false);
  }

  public *[Symbol.iterator](): Iterator<never> {}

  public toArray(): Array<never> {
    return [];
  }

  public toJSON(): None.JSON {
    return {
      type: "none",
    };
  }

  public toString(): string {
    return "None";
  }
})();

/**
 * @public
 */
export namespace None {
  export interface JSON {
    [key: string]: json.JSON;
    type: "none";
  }
}
