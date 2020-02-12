import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";
import * as json from "@siteimprove/alfa-json";

import { Token } from "../syntax/token";

const { map } = Parser;

/**
 * @see https://drafts.csswg.org/css-values/#percentages
 */
export class Percentage implements Equatable, Serializable {
  public static of(value: number): Percentage {
    return new Percentage(value);
  }

  private readonly _value: number;

  private constructor(value: number) {
    this._value = value;
  }

  public get type(): "percentage" {
    return "percentage";
  }

  public get value(): number {
    return this._value;
  }

  public equals(value: unknown): value is this {
    return value instanceof Percentage && value._value === this._value;
  }

  public toString(): string {
    return `${this._value * 100}%`;
  }

  public toJSON(): Percentage.JSON {
    return {
      type: "percentage",
      value: this._value
    };
  }
}

export namespace Percentage {
  export interface JSON {
    [key: string]: json.JSON;
    type: "percentage";
    value: number;
  }

  export function isPercentage(value: unknown): value is Percentage {
    return value instanceof Percentage;
  }

  export const parse: Parser<
    Slice<Token>,
    Percentage,
    string
  > = map(Token.parsePercentage(), percentage =>
    Percentage.of(percentage.value)
  );
}
