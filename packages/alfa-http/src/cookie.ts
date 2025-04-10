import type { Equatable } from "@siteimprove/alfa-equatable";
import type { Serializable } from "@siteimprove/alfa-json";

import type * as json from "@siteimprove/alfa-json";

/**
 * @public
 */
export class Cookie implements Equatable, Serializable<Cookie.JSON> {
  public static of(name: string, value: string): Cookie {
    return new Cookie(name, value);
  }

  private readonly _name: string;
  private readonly _value: string;

  protected constructor(name: string, value: string) {
    this._name = name;
    this._value = value;
  }

  public get name(): string {
    return this._name;
  }

  public get value(): string {
    return this._value;
  }

  public equals(value: Cookie): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
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

/**
 * @public
 */
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
