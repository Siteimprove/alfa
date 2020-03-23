import { Parser } from "@siteimprove/alfa-parser";

import { Token } from "../syntax/token";
import { Numeric } from "./numeric";

const { map } = Parser;

/**
 * @see https://drafts.csswg.org/css-values/#numbers
 */
export class Number extends Numeric {
  public static of(value: number): Number {
    return new Number(value);
  }

  private constructor(value: number) {
    super(value);
  }

  public get type(): "number" {
    return "number";
  }

  public equals(value: unknown): value is this {
    return value instanceof Number && super.equals(value);
  }

  public toJSON(): Number.JSON {
    return {
      type: "number",
      value: this._value,
    };
  }

  public toString(): string {
    return `${this._value}`;
  }
}

export namespace Number {
  export interface JSON extends Numeric.JSON {
    type: "number";
  }

  export function isNumber(value: unknown): value is Number {
    return value instanceof Number;
  }

  /**
   * @see https://drafts.csswg.org/css-values/#zero-value
   */
  export const parseZero = map(
    Token.parseNumber((number) => number.value === 0),
    (number) => Number.of(number.value)
  );

  /**
   * @see https://drafts.csswg.org/css-values/#number-value
   */
  export const parse = map(Token.parseNumber(), (number) =>
    Number.of(number.value)
  );
}
