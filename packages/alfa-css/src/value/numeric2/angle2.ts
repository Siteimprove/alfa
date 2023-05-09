import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../syntax";
import { Converter, Unit } from "../../unit";
import { Dimension2 } from "./dimension2";

const { map } = Parser;

/**
 * {@link https://drafts.csswg.org/css-values/#angles}
 *
 * @public
 */
export class Angle2<U extends Unit.Angle = Unit.Angle> extends Dimension2<
  "angle",
  Unit.Angle,
  U
> {
  public static of<U extends Unit.Angle>(value: number, unit: U): Angle2<U> {
    return new Angle2(value, unit);
  }

  private constructor(value: number, unit: U) {
    super(value, unit, "angle");
  }

  public get canonicalUnit(): "deg" {
    return "deg";
  }

  public hasUnit<U extends Unit.Angle>(unit: U): this is Angle2<U> {
    return (this._unit as Unit.Angle) === unit;
  }

  public withUnit<U extends Unit.Angle>(unit: U): Angle2<U> {
    if (this.hasUnit(unit)) {
      return this;
    }

    return new Angle2(Converter.angle(this._value, this._unit, unit), unit);
  }

  public scale(factor: number): Angle2<U> {
    return new Angle2(this._value * factor, this._unit);
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Angle2 &&
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
export namespace Angle2 {
  export interface JSON<U extends Unit.Angle = Unit.Angle>
    extends Dimension2.JSON<"angle", U> {}

  export function isAngle(value: unknown): value is Angle2 {
    return value instanceof Angle2;
  }

  export const parse: Parser<Slice<Token>, Angle2, string> = map(
    Token.parseDimension((dimension) => Unit.isAngle(dimension.unit)),
    (dimension) => Angle2.of(dimension.value, dimension.unit as Unit.Angle)
  );
}
