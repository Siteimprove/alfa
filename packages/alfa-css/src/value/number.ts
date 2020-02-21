import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { round } from "@siteimprove/alfa-math";
import { Parser } from "@siteimprove/alfa-parser";

import * as json from "@siteimprove/alfa-json";

import { Token } from "../syntax/token";

const { map } = Parser;

/**
 * @see https://drafts.csswg.org/css-values/#numbers
 */
export class Number implements Equatable, Hashable, Serializable {
  public static of(value: number): Number {
    return new Number(value);
  }

  private readonly _value: number;

  private constructor(value: number) {
    this._value = value;
  }

  public get type(): "number" {
    return "number";
  }

  public get value(): number {
    return this._value;
  }

  public equals(value: unknown): value is this {
    return value instanceof Number && value._value === this._value;
  }

  public hash(hash: Hash): void {
    Hash.writeFloat64(hash, this._value);
  }

  public toJSON(): Number.JSON {
    return {
      type: "number",
      value: this._value
    };
  }

  public toString(): string {
    return `${round(this._value, 2)}`;
  }
}

export namespace Number {
  export interface JSON {
    [key: string]: json.JSON;
    type: "number";
    value: number;
  }

  export function isNumber(value: unknown): value is Number {
    return value instanceof Number;
  }

  /**
   * @see https://drafts.csswg.org/css-values/#zero-value
   */
  export const parseZero = map(
    Token.parseNumber(number => number.value === 0),
    number => Number.of(number.value)
  );

  /**
   * @see https://drafts.csswg.org/css-values/#number-value
   */
  export const parse = map(Token.parseNumber(), number =>
    Number.of(number.value)
  );
}
