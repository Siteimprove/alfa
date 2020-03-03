import { Parser } from "@siteimprove/alfa-parser";

import { Token } from "../syntax/token";
import { Numeric } from "./numeric";

const { map } = Parser;

/**
 * @see https://drafts.csswg.org/css-values/#percentages
 */
export class Percentage extends Numeric {
  public static of(value: number): Percentage {
    return new Percentage(value);
  }

  private constructor(value: number) {
    super(value);
  }

  public get type(): "percentage" {
    return "percentage";
  }

  public equals(value: unknown): value is this {
    return value instanceof Percentage && super.equals(value);
  }

  public toJSON(): Percentage.JSON {
    return {
      type: "percentage",
      value: this._value
    };
  }

  public toString(): string {
    return `${this._value}%`;
  }
}

export namespace Percentage {
  export interface JSON extends Numeric.JSON {
    type: "percentage";
  }

  export function isPercentage(value: unknown): value is Percentage {
    return value instanceof Percentage;
  }

  export const parse = map(Token.parsePercentage(), percentage =>
    Percentage.of(percentage.value)
  );
}
