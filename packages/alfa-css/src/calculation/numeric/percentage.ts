import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { type Parser as CSSParser, Token } from "../../syntax";
import { Numeric } from "./numeric";

const { map } = Parser;

/**
 * {@link https://drafts.csswg.org/css-values/#percentages}
 *
 * @public
 */
export class Percentage extends Numeric<"percentage"> {
  public static of(value: number): Percentage {
    return new Percentage(value);
  }

  private constructor(value: number) {
    super(value, "percentage");
  }

  public scale(factor: number): Percentage {
    return new Percentage(this._value * factor);
  }

  public equals(value: unknown): value is this {
    return value instanceof Percentage && super.equals(value);
  }

  public toJSON(): Percentage.JSON {
    return super.toJSON();
  }

  public toString(): string {
    return `${this._value * 100}%`;
  }
}

/**
 * @public
 */
export namespace Percentage {
  export interface JSON extends Numeric.JSON<"percentage"> {}

  export function isPercentage(value: unknown): value is Percentage {
    return value instanceof Percentage;
  }

  export const parse: CSSParser<Percentage> = map(
    Token.parsePercentage(),
    (percentage) => Percentage.of(percentage.value)
  );
}
