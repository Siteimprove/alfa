import { Comparable } from "@siteimprove/alfa-comparable";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Math } from "../../calculation";
import { Angle as BaseAngle } from "../../calculation/numeric";
import { Token } from "../../syntax";
import { Converter, Unit } from "../../unit";
import { Value } from "../../value";

import { Dimension } from "./dimension";

const { either, map } = Parser;

/**
 * {@link https://drafts.csswg.org/css-values/#numbers}
 *
 * @public
 */
export type Angle<U extends Unit.Angle = Unit.Angle> =
  | Angle.Calculated
  | Angle.Fixed<U>;

/**
 * {@link https://drafts.csswg.org/css-values/#numbers}
 *
 * @public
 */
export namespace Angle {
  /**
   * Angles that are the result of a calculation.
   */
  export class Calculated
    extends Dimension.Calculated<"angle">
    implements IAngle<true>
  {
    public static of(value: Math<"angle">): Calculated {
      return new Calculated(value);
    }

    private constructor(value: Math<"angle">) {
      super(value, "angle");
    }

    public hasCalculation(): this is Calculated {
      return true;
    }

    public resolve(): Fixed<"deg"> {
      return Fixed.of(
        this._math
          .resolve2()
          // Since the expression has been correctly typed, it should always resolve.
          .getUnsafe(`Could not resolve ${this._math} as an angle`)
      );
    }

    public equals(value: unknown): value is this {
      return value instanceof Calculated && super.equals(value);
    }
  }

  /**
   * @public
   */
  export namespace Calculated {
    export interface JSON extends Dimension.Calculated.JSON<"angle"> {}
  }

  /**
   * Angles that are a fixed (not calculated) value.
   */
  export class Fixed<U extends Unit.Angle = Unit.Angle>
    extends Dimension.Fixed<"angle", U>
    implements IAngle<false>, Comparable<Fixed<U>>
  {
    public static of<U extends Unit.Angle>(value: number, unit: U): Fixed<U>;

    public static of<U extends Unit.Angle>(value: BaseAngle<U>): Fixed<U>;

    public static of<U extends Unit.Angle>(
      value: number | BaseAngle<U>,
      unit?: U
    ): Fixed<U> {
      if (typeof value === "number") {
        // The overloads ensure that unit is not undefined
        return new Fixed(value, unit!);
      }

      return new Fixed(value.value, value.unit);
    }

    private constructor(value: number, unit: U) {
      super(value, unit, "angle");
    }

    public hasCalculation(): this is Calculated {
      return false;
    }

    public hasUnit<U extends Unit.Angle>(unit: U): this is Fixed<U> {
      return (this._unit as Unit.Angle) === unit;
    }

    public withUnit<U extends Unit.Angle>(unit: U): Fixed<U> {
      if (this.hasUnit(unit)) {
        return this;
      }

      return Fixed.of(Converter.angle(this._value, this._unit, unit), unit);
    }

    public scale(factor: number): Fixed<U> {
      return new Fixed(this._value * factor, this._unit);
    }

    public resolve(): Fixed<"deg"> {
      return this.withUnit("deg");
    }

    public equals(value: unknown): value is this {
      return value instanceof Fixed && super.equals(value);
    }
  }

  /**
   * @public
   */
  export namespace Fixed {
    export interface JSON<U extends Unit.Angle = Unit.Angle>
      extends Dimension.Fixed.JSON<"angle", U> {}
  }

  export type JSON = Calculated.JSON | Fixed.JSON;

  interface IAngle<CALC extends boolean = boolean>
    extends Value<"angle", CALC> {
    hasCalculation(): this is Calculated;
    resolve(): Fixed<"deg">;
  }

  export function isCalculated(value: unknown): value is Calculated {
    return value instanceof Calculated;
  }

  export function isFixed(value: unknown): value is Fixed {
    return value instanceof Fixed;
  }

  export function isAngle(value: unknown): value is Angle {
    return value instanceof Calculated || value instanceof Fixed;
  }

  export function of<U extends Unit.Angle>(value: number, unit: U): Fixed<U>;

  export function of<U extends Unit.Angle>(value: BaseAngle<U>): Fixed<U>;

  export function of(value: Math<"angle">): Calculated;

  export function of<U extends Unit.Angle>(
    value: number | BaseAngle<U> | Math<"angle">,
    unit?: U
  ): Angle<U> {
    if (typeof value === "number") {
      // The overloads ensure that unit is not undefined
      return Fixed.of(value, unit!);
    }

    if (BaseAngle.isAngle(value)) {
      return Fixed.of(value.value, value.unit);
    }

    return Calculated.of(value);
  }

  /**
   * {@link https://drafts.csswg.org/css-values/#number-value}
   */
  export const parse: Parser<Slice<Token>, Angle, string> = either(
    map<Slice<Token>, BaseAngle, Fixed, string>(BaseAngle.parse, of),
    map(Math.parseAngle, of)
  );

  // TODO: temporary helper needed during migration
  export const parseBase: Parser<Slice<Token>, Fixed, string> = map<
    Slice<Token>,
    BaseAngle,
    Fixed,
    string
  >(BaseAngle.parse, of);
}
