import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../syntax/token";

import { Numeric } from "./numeric";

const { map } = Parser;

/**
 * {@link https://drafts.csswg.org/css-values/#integers}
 *
 * @public
 */
export class Integer extends Numeric<"integer"> {
  public static of(value: number): Integer {
    return new Integer(value | 0);
  }

  private constructor(value: number) {
    super(value);
  }

  public get type(): "integer" {
    return "integer";
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
    return {
      type: "integer",
      value: this._value,
    };
  }
}

/**
 * @public
 */
export namespace Integer {
  export interface JSON extends Numeric.JSON<"integer"> {
    value: number;
  }

  export function isInteger(value: unknown): value is Integer {
    return value instanceof Integer;
  }

  export const parse: Parser<Slice<Token>, Integer, string> = map(
    Token.parseNumber((number) => number.isInteger),
    (integer) => Integer.of(integer.value)
  );
}
