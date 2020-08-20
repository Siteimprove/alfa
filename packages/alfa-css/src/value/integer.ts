import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import { Token } from "../syntax/token";

import { Numeric } from "./numeric";

const { map } = Parser;

/**
 * @see https://drafts.csswg.org/css-values/#integers
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

  public equals(value: unknown): value is this {
    return value instanceof Integer && super.equals(value);
  }

  public hash(hash: Hash): void {
    Hash.writeInt32(hash, this._value);
  }

  public toJSON(): Integer.JSON {
    return {
      type: "integer",
      value: this._value,
    };
  }
}

export namespace Integer {
  export interface JSON extends Numeric.JSON {
    type: "integer";
  }

  export function isInteger(value: unknown): value is Integer {
    return value instanceof Integer;
  }

  export const parse = map(
    Token.parseNumber((number) => number.isInteger),
    (integer) => Integer.of(integer.value)
  );
}
