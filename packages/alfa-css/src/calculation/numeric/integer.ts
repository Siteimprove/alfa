import type { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import { type Parser as CSSParser, Token } from "../../syntax/index.js";

import { Numeric } from "./numeric.js";

const { map } = Parser;

/**
 * {@link https://drafts.csswg.org/css-values/#integers}
 *
 * @public
 */
export class Integer extends Numeric<"integer"> {
  /**
   * {@link https://drafts.csswg.org/css-values/#css-round-to-the-nearest-integer}
   */
  public static of(value: number): Integer {
    // Math.round ensure the correct rounding.
    // The bitwise or ensure coercion to 32 bits integer
    return new Integer(Math.round(value) | 0);
  }

  private constructor(value: number) {
    super(value, "integer");
  }

  public scale(factor: number): Integer {
    return new Integer(this._value * factor);
  }

  public equals(value: unknown): value is this {
    return value instanceof Integer && super.equals(value);
  }

  public hash(hash: Hash): void {
    hash.writeInt32(this._value);
  }

  public toJSON(): Integer.JSON {
    return super.toJSON();
  }
}

/**
 * @public
 */
export namespace Integer {
  export interface JSON extends Numeric.JSON<"integer"> {}

  export function isInteger(value: unknown): value is Integer {
    return value instanceof Integer;
  }

  export const parse: CSSParser<Integer> = map(
    Token.parseNumber((number) => number.isInteger),
    (integer) => Integer.of(integer.value),
  );
}
