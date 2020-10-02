import { Hash } from "@siteimprove/alfa-hash";
import { Thunk } from "@siteimprove/alfa-thunk";

import * as json from "@siteimprove/alfa-json";

import { Option } from "./option";
import { Some } from "./some";

export interface None extends Option<never> {}

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

  public flatMap(): None {
    return this;
  }

  public reduce<U>(reducer: unknown, accumulator: U): U {
    return accumulator;
  }

  public apply(): None {
    return this;
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

  public get(): never {
    throw new Error("Attempted to .get() from None");
  }

  public getOr<U>(value: U): U {
    return value;
  }

  public getOrElse<U>(value: Thunk<U>): U {
    return value();
  }

  public equals(value: unknown): value is this {
    return value instanceof None;
  }

  public hash(hash: Hash): void {
    Hash.writeBoolean(hash, false);
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

export namespace None {
  export interface JSON {
    [key: string]: json.JSON;
    type: "none";
  }
}
