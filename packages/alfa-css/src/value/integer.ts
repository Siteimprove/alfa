import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";
import * as json from "@siteimprove/alfa-json";

import { Token } from "../syntax/token";

const { map } = Parser;

/**
 * @see https://drafts.csswg.org/css-values/#integers
 */
export class Integer implements Equatable, Serializable {
  public static of(value: number): Integer {
    return new Integer(value);
  }

  private readonly _value: number;

  private constructor(value: number) {
    this._value = value | 0;
  }

  public get type(): "integer" {
    return "integer";
  }

  public get value(): number {
    return this._value;
  }

  public equals(value: unknown): value is this {
    return value instanceof Integer && value._value === this._value;
  }

  public toString(): string {
    return `${this._value}`;
  }

  public toJSON(): Integer.JSON {
    return {
      type: "integer",
      value: this._value
    };
  }
}

export namespace Integer {
  export interface JSON {
    [key: string]: json.JSON;
    type: "integer";
    value: number;
  }

  export function isInteger(value: unknown): value is Integer {
    return value instanceof Integer;
  }

  export const parse = map(
    Token.parseNumber(number => number.isInteger),
    integer => Integer.of(integer.value)
  );
}
