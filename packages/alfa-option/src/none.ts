import { Thunk } from "@siteimprove/alfa-thunk";
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

  public map(): this {
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

  public or<U>(option: Option<U>): Option<U> {
    return option;
  }

  public orElse<U>(option: Thunk<Option<U>>): Option<U> {
    return option();
  }

  public getOr<U>(value: U): U {
    return value;
  }

  public getOrElse<U>(value: Thunk<U>): U {
    return value();
  }

  public equals(value: unknown): value is None {
    return value === this;
  }

  public toJSON(): {} {
    return {};
  }

  public toString() {
    return "None";
  }
})();
