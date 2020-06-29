import { Equatable } from "@siteimprove/alfa-equatable";

import * as earl from "@siteimprove/alfa-earl";
import * as json from "@siteimprove/alfa-json";

export class Header implements Equatable, json.Serializable, earl.Serializable {
  public static of(name: string, value: string): Header {
    return new Header(name, value);
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
      value instanceof Header &&
      value._name === this._name &&
      value._value === this._value
    );
  }

  public toJSON(): Header.JSON {
    return {
      name: this._name,
      value: this._value,
    };
  }

  public toEARL(): Header.EARL {
    return {
      "@context": {
        http: "http://www.w3.org/2011/http#",
      },
      "@type": "http:MessageHeader",
      "http:fieldName": this._name,
      "http:fieldValue": this._value,
    };
  }

  public toString(): string {
    return `${this._name}: ${this._value}`;
  }
}

export namespace Header {
  export interface JSON {
    [key: string]: json.JSON;
    name: string;
    value: string;
  }

  export interface EARL extends earl.EARL {
    "@context": {
      http: "http://www.w3.org/2011/http#";
    };
    "@type": "http:MessageHeader";
    "http:fieldName": string;
    "http:fieldValue": string;
  }

  export function from(json: JSON): Header {
    return Header.of(json.name, json.value);
  }

  export function isHeader(value: unknown): value is Header {
    return value instanceof Header;
  }
}
