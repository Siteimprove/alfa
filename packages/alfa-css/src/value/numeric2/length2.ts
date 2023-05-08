import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../syntax";

import { Converter, Convertible, Unit } from "../../unit";
import { Dimension2 } from "./dimension2";

const { map, either } = Parser;

/**
 * {@link https://drafts.csswg.org/css-values/#lengths}
 *
 * @public
 */
export class Length2<U extends Unit.Length = Unit.Length>
  extends Dimension2<"length", Unit.Length, U>
  implements Convertible<Unit.Length.Absolute>
{
  public static of<U extends Unit.Length>(value: number, unit: U): Length2<U> {
    return new Length2(value, unit);
  }

  private constructor(value: number, unit: U) {
    super(value, unit, "length");
  }

  public get canonicalUnit(): "px" {
    return "px";
  }

  public hasUnit<U extends Unit.Length>(unit: U): this is Length2<U> {
    return (this._unit as Unit.Length) === unit;
  }

  public withUnit<U extends Unit.Length>(unit: U): Length2<U> {
    if (this.hasUnit(unit)) {
      return this;
    }

    if (Unit.isAbsoluteLength(unit) && Unit.isAbsoluteLength(this._unit)) {
      return Length2.of(Converter.length(this._value, this._unit, unit), unit);
    }

    throw new Error(`Cannot convert ${this._unit} to ${unit}`);
  }

  public isRelative(): this is Length2<Unit.Length.Relative> {
    return Unit.isRelativeLength(this._unit);
  }

  public isFontRelative(): this is Length2<Unit.Length.Relative.Font> {
    return Unit.isFontRelativeLength(this._unit);
  }

  public isViewportRelative(): this is Length2<Unit.Length.Relative.Viewport> {
    return Unit.isViewportRelativeLength(this._unit);
  }

  public isAbsolute(): this is Length2<Unit.Length.Absolute> {
    return Unit.isAbsoluteLength(this._unit);
  }

  public scale(factor: number): Length2<U> {
    return new Length2(this._value * factor, this._unit);
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Length2 &&
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
export namespace Length2 {
  export interface JSON<U extends Unit.Length = Unit.Length>
    extends Dimension2.JSON<"length", U> {}

  export function isLength(value: unknown): value is Length2 {
    return value instanceof Length2;
  }

  export const parse: Parser<Slice<Token>, Length2, string> = either(
    map(
      Token.parseDimension((dimension) => Unit.isLength(dimension.unit)),
      (dimension) => Length2.of(dimension.value, dimension.unit as Unit.Length)
    ),
    map(
      Token.parseNumber((number) => number.isInteger && number.value === 0),
      () => Length2.of(0, "px")
    )
  );

  export function isZero(length: Length2): boolean {
    return length.value === 0;
  }
}
