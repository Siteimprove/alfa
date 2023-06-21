import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../syntax";

import { Converter, Unit } from "../../unit";
import { Dimension } from "./dimension";

const { map, either } = Parser;

/**
 * {@link https://drafts.csswg.org/css-values/#lengths}
 *
 * @public
 */
export class Length<U extends Unit.Length = Unit.Length> extends Dimension<
  "length",
  U
> {
  public static of<U extends Unit.Length>(value: number, unit: U): Length<U> {
    return new Length(value, unit);
  }

  private constructor(value: number, unit: U) {
    super(value, unit, "length");
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

  public isRelative(): this is Length<Unit.Length.Relative> {
    return Unit.isRelativeLength(this._unit);
  }

  public scale(factor: number): Length<U> {
    return new Length(this._value * factor, this._unit);
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
    hash.writeString(this._unit);
  }

  public toString(): string {
    return `${this._value}${this._unit}`;
  }
}

/**
 * @public
 */
export namespace Length {
  export interface JSON<U extends Unit.Length = Unit.Length>
    extends Dimension.JSON<"length", U> {}

  export function isLength(value: unknown): value is Length {
    return value instanceof Length;
  }

  /**
   * {@link https://drafts.csswg.org/css-values/#lengths}
   */
  export const parse: Parser<Slice<Token>, Length, string> = either(
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
