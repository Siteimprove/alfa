import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

export class Cookie implements Equatable, Serializable {
  public static of(name: string, value: string): Cookie {
    return new Cookie(name, value);
  }

  private readonly _name: string;
  private readonly _value: string;

  private constructor(name: string, value: string) {
    this._name = name;
    this._value = value;
  }

  public get name(): string {
    return this._name;
  }

  public get value(): string {
    return this._value;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Cookie &&
      value._name === this._name &&
      value._value === this._value
    );
  }

  public toJSON(): Cookie.JSON {
    return {
      name: this._name,
      value: this._value,
    };
  }

  public toString(): string {
    return `${this._name}=${this._value}`;
  }
}

export namespace Cookie {
  export interface JSON {
    [key: string]: json.JSON;
    name: string;
    value: string;
  }

  export function from(json: JSON): Cookie {
    return Cookie.of(json.name, json.value);
  }

  export function isCookie(value: unknown): value is Cookie {
    return value instanceof Cookie;
  }
}
