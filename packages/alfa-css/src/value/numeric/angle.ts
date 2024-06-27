import { Comparable } from "@siteimprove/alfa-comparable";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Math } from "../../calculation/index.js";
import { Angle as BaseAngle } from "../../calculation/numeric/index.js";
import { type Parser as CSSParser, Token } from "../../syntax/index.js";
import { Converter, Unit } from "../../unit/index.js";

import type { Resolvable } from "../resolvable.js";

import { Dimension } from "./dimension.js";
import { Length } from "./length.js";
import type { Numeric } from "./numeric.js";

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
  export type Canonical = Fixed<"deg">;

  export type Resolver = {};

  /**
   * Angles that are the result of a calculation.
   */
  export class Calculated
    extends Dimension.Calculated<"angle">
    implements Resolvable<Canonical, never>
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

    public resolve(resolver?: Numeric.GenericResolver): Canonical {
      return Fixed.of(
        this._math
          .resolve(Length.toExpressionResolver(resolver))
          // Since the expression has been correctly typed, it should always resolve.
          .getUnsafe(`Could not resolve ${this._math} as an angle`),
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
    implements Resolvable<Canonical, never>, Comparable<Fixed<U>>
  {
    public static of<U extends Unit.Angle>(value: number, unit: U): Fixed<U>;

    public static of<U extends Unit.Angle>(value: BaseAngle<U>): Fixed<U>;

    public static of<U extends Unit.Angle>(
      value: number | BaseAngle<U>,
      unit?: U,
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

    public hasCalculation(): this is never {
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

    public resolve(): Canonical {
      return this.withUnit("deg");
    }

    /**
     * @internal
     */
    public toBase(): BaseAngle<U> {
      return BaseAngle.of(this._value, this._unit);
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
    unit?: U,
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
  export const parse: CSSParser<Angle> = either(
    map<Slice<Token>, BaseAngle, Fixed, string>(BaseAngle.parse, of),
    map(Math.parseAngle, of),
  );
}
