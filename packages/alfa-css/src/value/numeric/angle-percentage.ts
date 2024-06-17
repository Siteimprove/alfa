import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Math } from "../../calculation";
import * as Base from "../../calculation/numeric";
import { type Parser as CSSParser, Token } from "../../syntax";
import { Unit } from "../../unit";

import type { PartiallyResolvable, Resolvable } from "../resolvable";

import { Dimension } from "./dimension";
import { Angle } from "./angle";
import type { Numeric } from "./numeric";
import { Percentage } from "./percentage";

const { either, map } = Parser;

/**
 * @public
 */
export type AnglePercentage<U extends Unit.Angle = Unit.Angle> =
  | AnglePercentage.Calculated
  | Angle.Calculated
  | Angle.Fixed<U>
  | Percentage.Calculated<"angle">
  | Percentage.Fixed<"angle">;

/**
 * @public
 */
export namespace AnglePercentage {
  export type Canonical = Angle.Canonical;

  /**
   * Angle-percentages that are the result of a calculation.
   */
  export class Calculated
    extends Dimension.Calculated<"angle-percentage">
    implements Resolvable<Canonical, never>
  {
    public static of(value: Math<"angle-percentage">): Calculated {
      return new Calculated(value);
    }

    private constructor(math: Math<"angle-percentage">) {
      super(math, "angle-percentage");
    }

    public hasCalculation(): this is Calculated {
      return true;
    }

    public resolve(resolver?: Numeric.GenericResolver): Canonical {
      return Angle.Fixed.of(
        this._math
          // The math expression resolver is only aware of BasePercentage and
          // thus work with it, but we want to abstract it from further layers,
          // so the resolver here is only aware of Percentage, and we need to
          // translate back and forth.
          .resolve({
            // 100% is always 1 full turn!
            percentage: (value) => Base.Angle.of(360, "deg").scale(value.value),
          })
          // Since the expression has been correctly typed, it should always resolve.
          .getUnsafe(`Could not resolve ${this._math} as an angle`),
      );
    }

    public equals(value: unknown): value is this {
      return value instanceof Calculated && super.equals(value);
    }
  }

  export namespace Calculated {
    export interface JSON
      extends Dimension.Calculated.JSON<"angle-percentage"> {}
  }

  export type JSON =
    | Calculated.JSON
    | Angle.Calculated.JSON
    | Angle.Fixed.JSON
    | Percentage.Calculated.JSON
    | Percentage.Fixed.JSON;

  /**
   * Fully resolves an angle-percentage, when a full resolver is provided.
   */
  export function resolve(
    value: AnglePercentage,
    resolver?: Numeric.GenericResolver,
  ): Canonical {
    return Percentage.isPercentage(value)
      ? value.resolve({ percentageBase: Angle.of(360, "deg") })
      : value.resolve();
  }

  export function isAnglePercentage(value: unknown): value is AnglePercentage {
    return (
      value instanceof Calculated ||
      Angle.isAngle(value) ||
      Percentage.isPercentage(value)
    );
  }

  export function isCalculated(
    value: unknown,
  ): value is Calculated | Angle.Calculated | Percentage.Calculated {
    return (
      value instanceof Calculated ||
      Angle.isCalculated(value) ||
      Percentage.isCalculated(value)
    );
  }

  export function isFixed(value: unknown): value is Angle.Fixed {
    return value instanceof Angle.Fixed;
  }

  export function isPercentage(value: unknown): value is Percentage.Fixed {
    return value instanceof Percentage.Fixed;
  }

  export function of<U extends Unit.Angle>(
    value: number,
    unit: U,
  ): Angle.Fixed<U>;

  export function of<U extends Unit.Angle>(
    value: Base.Angle<U>,
  ): Angle.Fixed<U>;

  export function of(value: number): Percentage.Fixed;

  export function of(value: Base.Percentage): Percentage.Fixed;

  export function of(value: Math<"angle">): Angle.Calculated;

  export function of(value: Math<"angle-percentage">): Calculated;

  export function of(value: Math<"percentage">): Percentage.Calculated;

  export function of<U extends Unit.Angle>(
    value:
      | number
      | Base.Angle<U>
      | Base.Percentage
      | Math<"angle">
      | Math<"angle-percentage">
      | Math<"percentage">,
    unit?: U,
  ): AnglePercentage<U> {
    if (typeof value === "number") {
      if (unit === undefined) {
        return Percentage.of(value);
      } else {
        return Angle.of(value, unit);
      }
    }

    if (Base.Angle.isAngle(value)) {
      return Angle.of(value.value, value.unit);
    }

    if (Base.Percentage.isPercentage(value)) {
      return Percentage.of(value.value);
    }

    // value must be a math expression

    if (value.isPercentage()) {
      return Percentage.of(value);
    }

    if (value.isDimension("angle")) {
      return Angle.of(value);
    }

    return Calculated.of(value);
  }

  /**
   * {@link https://drafts.csswg.org/css-values/#angles}
   */
  export const parse: CSSParser<AnglePercentage> = either<
    Slice<Token>,
    AnglePercentage,
    string
  >(
    Angle.parse,
    Percentage.parse<"angle">,
    map<Slice<Token>, Math<"angle-percentage">, Calculated, string>(
      Math.parseAnglePercentage,
      of,
    ),
  );
}
