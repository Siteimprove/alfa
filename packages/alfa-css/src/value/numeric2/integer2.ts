import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../syntax";

import { Numeric2 } from "./numeric2";

const { map } = Parser;

/**
 * {@link https://drafts.csswg.org/css-values/#integers}
 *
 * @public
 */
export class Integer2 extends Numeric2<"integer"> {
  public static of(value: number): Integer2 {
    return new Integer2(value | 0);
  }

  private constructor(value: number) {
    super(value, "integer");
  }

  public scale(factor: number): Integer2 {
    return new Integer2(this._value * factor);
  }

  public equals(value: unknown): value is this {
    return value instanceof Integer2 && super.equals(value);
  }

  public hash(hash: Hash): void {
    hash.writeInt32(this._value);
  }
}

/**
 * @public
 */
export namespace Integer2 {
  export interface JSON extends Numeric2.JSON<"integer"> {}

  export function isInteger(value: unknown): value is Integer2 {
    return value instanceof Integer2;
  }

  export const parse: Parser<Slice<Token>, Integer2, string> = map(
    Token.parseNumber((number) => number.isInteger),
    (integer) => Integer2.of(integer.value)
  );
}
