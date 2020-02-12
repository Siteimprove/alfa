import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";

import * as json from "@siteimprove/alfa-json";

import { Token } from "../syntax/token";
import { Converter, Convertible } from "./converter";
import { Unit } from "./unit";

const { map } = Parser;

/**
 * @see https://drafts.csswg.org/css-values/#angles
 */
export class Angle<U extends Unit.Angle = Unit.Angle>
  implements Convertible<Unit.Angle>, Equatable, Serializable {
  public static of<U extends Unit.Angle>(value: number, unit: U): Angle<U> {
    return new Angle(value, unit);
  }

  private readonly _value: number;
  private readonly _unit: U;

  private constructor(value: number, unit: U) {
    this._value = value;
    this._unit = unit;
  }

  public get type(): "angle" {
    return "angle";
  }

  public get value(): number {
    return this._value;
  }

  public get unit(): U {
    return this._unit;
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
      value._value === this._value &&
      value._unit === this._unit
    );
  }

  public toString(): string {
    return `${this._value}${this._unit}`;
  }

  public toJSON(): Angle.JSON {
    return {
      type: "angle",
      value: this._value,
      unit: this._unit
    };
  }
}

export namespace Angle {
  export interface JSON {
    [key: string]: json.JSON;
    type: "angle";
    value: number;
    unit: string;
  }

  export function isAngle(value: unknown): value is Angle {
    return value instanceof Angle;
  }

  export const parse = map(
    Token.parseDimension(dimension => Unit.isAngle(dimension.unit)),
    dimension => Angle.of(dimension.value, dimension.unit as Unit.Angle)
  );
}
