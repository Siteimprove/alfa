import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";
import * as json from "@siteimprove/alfa-json";

import { Token } from "../syntax/token";

const { map } = Parser;

/**
 * @see https://drafts.csswg.org/css-values/#strings
 */
export class String implements Equatable, Serializable {
  public static of(value: string): String {
    return new String(value);
  }

  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public get type(): "string" {
    return "string";
  }

  public get value(): string {
    return this._value;
  }

  public equals(value: unknown): value is this {
    return value instanceof String && value._value === this._value;
  }

  public toString(): string {
    return `${this._value}`;
  }

  public toJSON(): String.JSON {
    return {
      type: "string",
      value: this._value
    };
  }
}

export namespace String {
  export interface JSON {
    [key: string]: json.JSON;
    type: "string";
    value: string;
  }

  export function isString(value: unknown): value is String {
    return value instanceof String;
  }

  export const parse: Parser<
    Slice<Token>,
    String,
    string
  > = map(Token.parseString(), string => String.of(string.value));
}
