import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import { Token } from "../syntax/token";

import { Converter, Convertible } from "./converter";
import { Unit } from "./unit";
import { Numeric } from "./numeric";

const { map } = Parser;

/**
 * @see https://drafts.csswg.org/css-values/#lengths
 */
export class Length<U extends Unit.Length = Unit.Length> extends Numeric
  implements Convertible<Unit.Length.Absolute> {
  public static of<U extends Unit.Length>(value: number, unit: U): Length<U> {
    return new Length(value, unit);
  }

  private readonly _unit: U;

  private constructor(value: number, unit: U) {
    super(value);
    this._unit = unit;
  }

  public get type(): "length" {
    return "length";
  }

  public get unit(): U {
    return this._unit;
  }

  public hasUnit<U extends Unit.Length>(unit: U): this is Length<U> {
    return (this._unit as Unit.Length) === unit;
  }

  public withUnit<U extends Unit.Length.Absolute>(unit: U): Length<U> {
    if (this.hasUnit(unit)) {
      return this;
    }

    if (Unit.Length.isAbsolute(this._unit)) {
      return Length.of(Converter.length(this._value, this._unit, unit), unit);
    }

    throw new Error(`Cannot convert ${this._unit} to ${unit}`);
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Length &&
      super.equals(value) &&
      value._unit === this._unit
    );
  }

  public hash(hash: Hash): void {
    super.hash(hash);
    Hash.writeString(hash, this._unit);
  }

  public toJSON(): Length.JSON {
    return {
      type: "length",
      value: this._value,
      unit: this._unit
    };
  }

  public toString(): string {
    return `${this._value}${this._unit}`;
  }
}

export namespace Length {
  export interface JSON extends Numeric.JSON {
    type: "length";
    unit: string;
  }

  export function isLength(value: unknown): value is Length {
    return value instanceof Length;
  }

  export const parse = map(
    Token.parseDimension(dimension => Unit.isLength(dimension.unit)),
    dimension => Length.of(dimension.value, dimension.unit as Unit.Length)
  );
}
