import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import { Token } from "../syntax/token";

import { Converter, Convertible } from "./converter";
import { Unit } from "./unit";
import { Dimension } from "./dimension";

const { map, either } = Parser;

/**
 * @see https://drafts.csswg.org/css-values/#lengths
 */
export class Length<U extends Unit.Length = Unit.Length>
  extends Dimension<"length", Unit.Length, U>
  implements Convertible<Unit.Length.Absolute> {
  public static of<U extends Unit.Length>(value: number, unit: U): Length<U> {
    return new Length(value, unit);
  }

  private constructor(value: number, unit: U) {
    super(value, unit);
  }

  public get type(): "length" {
    return "length";
  }

  public hasUnit<U extends Unit.Length>(unit: U): this is Length<U> {
    return (this._unit as Unit.Length) === unit;
  }

  public withUnit<U extends Unit.Length>(unit: U): Length<U> {
    if (this.hasUnit(unit)) {
      return this;
    }

    if (Unit.isAbsoluteLength(unit) && Unit.isAbsoluteLength(this._unit)) {
      return Length.of(Converter.length(this._value, this._unit, unit), unit);
    }

    throw new Error(`Cannot convert ${this._unit} to ${unit}`);
  }

  public isAbsolute(): this is Length<Unit.Length.Absolute> {
    return Unit.isAbsoluteLength(this._unit);
  }

  public isRelative(): this is Length<Unit.Length.Relative> {
    return Unit.isRelativeLength(this._unit);
  }

  public equals(value: unknown): value is this {
    return value instanceof Length && super.equals(value);
  }

  public hash(hash: Hash): void {
    super.hash(hash);
    Hash.writeString(hash, this._unit);
  }

  public toJSON(): Length.JSON {
    return {
      type: "length",
      value: this._value,
      unit: this._unit,
    };
  }

  public toString(): string {
    return `${this._value}${this._unit}`;
  }
}

export namespace Length {
  export interface JSON extends Dimension.JSON {
    type: "length";
    unit: Unit.Length;
  }

  export function isLength(value: unknown): value is Length {
    return value instanceof Length;
  }

  export const parse = either(
    map(
      Token.parseDimension((dimension) => Unit.isLength(dimension.unit)),
      (dimension) => Length.of(dimension.value, dimension.unit as Unit.Length)
    ),
    map(
      Token.parseNumber((number) => number.isInteger && number.value === 0),
      () => Length.of(0, "px")
    )
  );
}
