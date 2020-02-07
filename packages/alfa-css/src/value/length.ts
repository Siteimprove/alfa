import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";
import * as json from "@siteimprove/alfa-json";

import { Token } from "../syntax/token";

import { Converter, Convertible } from "./converter";
import { Unit } from "./unit";

const { map } = Parser;

/**
 * @see https://drafts.csswg.org/css-values/#lengths
 */
export class Length<U extends Unit.Length = Unit.Length>
  implements Convertible<Unit.Length.Absolute>, Equatable, Serializable {
  public static of<U extends Unit.Length>(value: number, unit: U): Length<U> {
    return new Length(value, unit);
  }

  private readonly _value: number;
  private readonly _unit: U;

  private constructor(value: number, unit: U) {
    this._value = value;
    this._unit = unit;
  }

  public get type(): "length" {
    return "length";
  }

  public get value(): number {
    return this._value;
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
      value._value === this._value &&
      value._unit === this._unit
    );
  }

  public toString(): string {
    return `${this._value}${this._unit}`;
  }

  public toJSON(): Length.JSON {
    return {
      type: "length",
      value: this._value,
      unit: this._unit
    };
  }
}

export namespace Length {
  export interface JSON {
    [key: string]: json.JSON;
    type: "length";
    value: number;
    unit: string;
  }

  export function isLength(value: unknown): value is Length {
    return value instanceof Length;
  }

  export const parse: Parser<Slice<Token>, Length, string> = map(
    Token.parseDimension(dimension => Unit.isLength(dimension.unit)),
    dimension => Length.of(dimension.value, dimension.unit as Unit.Length)
  );
}
