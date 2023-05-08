import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../syntax";
import { Numeric2 } from "./numeric2";

const { map } = Parser;

/**
 * {@link https://drafts.csswg.org/css-values/#numbers}
 *
 * @public
 */
export class Number2 extends Numeric2<"number"> {
  public static of(value: number): Number2 {
    return new Number2(value);
  }

  private constructor(value: number) {
    super(value, "number");
  }

  public scale(factor: number): Number2 {
    return new Number2(this._value * factor);
  }

  public equals(value: unknown): value is this {
    return value instanceof Number2 && super.equals(value);
  }
}

/**
 * @public
 */
export namespace Number2 {
  export interface JSON extends Numeric2.JSON<"number"> {}

  export function isNumber(value: unknown): value is Number2 {
    return value instanceof Number2;
  }

  /**
   * {@link https://drafts.csswg.org/css-values/#zero-value}
   */
  export const parseZero: Parser<Slice<Token>, Number2, string> = map(
    Token.parseNumber((number) => number.value === 0),
    (number) => Number2.of(number.value)
  );

  /**
   * {@link https://drafts.csswg.org/css-values/#number-value}
   */
  export const parse: Parser<Slice<Token>, Number2, string> = map(
    Token.parseNumber(),
    (number) => Number2.of(number.value)
  );
}
