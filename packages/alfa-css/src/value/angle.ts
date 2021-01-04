import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import { Token } from "../syntax/token";
import { Converter, Convertible } from "./converter";
import { Unit } from "./unit";
import { Dimension } from "./dimension";

const { map } = Parser;

/**
 * @see https://drafts.csswg.org/css-values/#angles
 */
export class Angle<U extends Unit.Angle = Unit.Angle> extends Dimension<
  "angle",
  Unit.Angle,
  U
> {
  public static of<U extends Unit.Angle>(value: number, unit: U): Angle<U> {
    return new Angle(value, unit);
  }

  private constructor(value: number, unit: U) {
    super(value, unit);
  }

  public get type(): "angle" {
    return "angle";
  }

  public hasUnit<U extends Unit.Angle>(unit: U): this is Angle<U> {
    return (this._unit as Unit.Angle) === unit;
  }

  public withUnit<U extends Unit.Angle>(unit: U): Angle<U> {
    if (this.hasUnit(unit)) {
      return this;
    }

    return new Angle(Converter.angle(this._value, this._unit, unit), unit);
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Angle &&
      super.equals(value) &&
      value._unit === this._unit
    );
  }

  public hash(hash: Hash): void {
    super.hash(hash);
    Hash.writeString(hash, this._unit);
  }

  public toJSON(): Angle.JSON {
    return {
      type: "angle",
      value: this._value,
      unit: this._unit,
    };
  }

  public toString(): string {
    return `${this._value}${this._unit}`;
  }
}

export namespace Angle {
  export interface JSON extends Dimension.JSON {
    type: "angle";
    unit: Unit.Angle;
  }

  export function isAngle(value: unknown): value is Angle {
    return value instanceof Angle;
  }

  export const parse = map(
    Token.parseDimension((dimension) => Unit.isAngle(dimension.unit)),
    (dimension) => Angle.of(dimension.value, dimension.unit as Unit.Angle)
  );
}
