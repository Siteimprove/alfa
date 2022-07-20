import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../syntax/token";

import { Converter, Convertible } from "../unit/converter";
import { Unit } from "../unit/unit";
import { Angle } from "./angle";
import { Dimension } from "./dimension";

const { map, either } = Parser;

/**
 * {@link https://drafts.csswg.org/css-values/#lengths}
 *
 * @public
 */
export class Length<U extends Unit.Length = Unit.Length>
  extends Dimension<"length", Unit.Length, U>
  implements Convertible<Unit.Length.Absolute>
{
  public static of<U extends Unit.Length>(value: number, unit: U): Length<U> {
    return new Length(value, unit);
  }

  private constructor(value: number, unit: U) {
    super(value, unit);
  }

  public get type(): "length" {
    return "length";
  }

  public get canonicalUnit(): "px" {
    return "px";
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

  public isFontRelative(): this is Length<Unit.Length.Relative.Font> {
    return Unit.isFontRelativeLength(this._unit);
  }

  public isViewportRelative(): this is Length<Unit.Length.Relative.Viewport> {
    return Unit.isViewportRelativeLength(this._unit);
  }

  public isAbsolute(): this is Length<Unit.Length.Absolute> {
    return Unit.isAbsoluteLength(this._unit);
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

  public toJSON(): Length.JSON<U> {
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

/**
 * @public
 */
export namespace Length {
  export interface JSON<U extends Unit.Length = Unit.Length>
    extends Dimension.JSON<"length"> {
    unit: U;
  }

  export function isLength(value: unknown): value is Length {
    return value instanceof Length;
  }

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

  export function isZero(length: Length): boolean {
    return length.value === 0;
  }
}
