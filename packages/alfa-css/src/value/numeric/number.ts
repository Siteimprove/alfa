import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../syntax/token";
import { Numeric } from "./numeric";

const { map } = Parser;

/**
 * {@link https://drafts.csswg.org/css-values/#numbers}
 *
 * @public
 */
export class Number extends Numeric<"number"> {
  public static of(value: number): Number {
    return new Number(value);
  }

  private constructor(value: number) {
    super(value);
  }

  public get type(): "number" {
    return "number";
  }

  public scale(factor: number): Number {
    return new Number(this._value * factor);
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
}

/**
 * @public
 */
export namespace Number {
  export interface JSON extends Numeric.JSON<"number"> {
    value: number;
  }

  export function isNumber(value: unknown): value is Number {
    return value instanceof Number;
  }

  /**
   * {@link https://drafts.csswg.org/css-values/#zero-value}
   */
  export const parseZero: Parser<Slice<Token>, Number, string> = map(
    Token.parseNumber((number) => number.value === 0),
    (number) => Number.of(number.value)
  );

  /**
   * {@link https://drafts.csswg.org/css-values/#number-value}
   */
  export const parse: Parser<Slice<Token>, Number, string> = map(
    Token.parseNumber(),
    (number) => Number.of(number.value)
  );
}
