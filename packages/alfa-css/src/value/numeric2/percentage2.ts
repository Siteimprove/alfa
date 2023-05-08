import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../syntax";
import { Numeric2 } from "./numeric2";

const { map } = Parser;

/**
 * {@link https://drafts.csswg.org/css-values/#percentages}
 *
 * @public
 */
export class Percentage2 extends Numeric2<"percentage"> {
  public static of(value: number): Percentage2 {
    return new Percentage2(value);
  }

  private constructor(value: number) {
    super(value, "percentage");
  }

  public scale(factor: number): Percentage2 {
    return new Percentage2(this._value * factor);
  }

  public equals(value: unknown): value is this {
    return value instanceof Percentage2 && super.equals(value);
  }

  public toString(): string {
    return `${this._value * 100}%`;
  }
}

/**
 * @public
 */
export namespace Percentage2 {
  export interface JSON extends Numeric2.JSON<"percentage"> {}

  export function isPercentage(value: unknown): value is Percentage2 {
    return value instanceof Percentage2;
  }

  export const parse: Parser<Slice<Token>, Percentage2, string> = map(
    Token.parsePercentage(),
    (percentage) => Percentage2.of(percentage.value)
  );
}
