import { Mapper } from "@siteimprove/alfa-mapper";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Math } from "../../calculation";
import {
  Length as BaseLength,
  Percentage as BasePercentage,
} from "../../calculation/numeric";
import { Token } from "../../syntax";
import { Unit } from "../../unit";
import { Value } from "../value";

import { Dimension } from "./dimension";
import { Length } from "./length";
import { Percentage } from "./percentage";

const { either, map } = Parser;

/**
 * @public
 */
export type LengthPercentage<U extends Unit.Length = Unit.Length> =
  | LengthPercentage.Calculated
  | Percentage.Fixed
  | Length.Fixed<U>;

/**
 * @public
 */
export namespace LengthPercentage {
  export type Canonical = Length.Fixed<"px">;

  /**
   * Lengths that are the result of a calculation.
   */
  export class Calculated
    extends Dimension.Calculated<"length-percentage">
    implements ILengthPercentage<true>
  {
    public static of(value: Math<"length-percentage">): Calculated {
      return new Calculated(value);
    }

    private constructor(math: Math<"length-percentage">) {
      super(math, "length-percentage");
    }

    public hasCalculation(): this is Calculated {
      return true;
    }

    public resolve(resolver: Resolver): Canonical {
      return Length.Fixed.of(
        this._math
          // The math expression resolver is only aware of BaseLength and
          // BasePercentage and thus work with these, but we want to abstract
          // them from further layers, so the resolver here is only aware of
          // Length and Percentage, and we need to translate back and forth.
          .resolve({
            length: (length) => {
              const resolved = resolver.length(Length.Fixed.of(length));
              return BaseLength.of(resolved.value, resolved.unit);
            },
            percentage: (value) =>
              BaseLength.of(
                resolver.percentageBase.value,
                /* this is "px"! */ resolver.percentageBase.unit
              ).scale(value.value),
          })
          // Since the expression has been correctly typed, it should always resolve.
          .getUnsafe(`Could not resolve ${this._math} as a length`)
      );
    }

    public equals(value: unknown): value is this {
      return value instanceof Calculated && super.equals(value);
    }
  }

  export namespace Calculated {
    export interface JSON extends Dimension.Calculated.JSON<"length"> {}
  }

  export type JSON = Calculated.JSON | Length.Fixed.JSON;

  interface ILengthPercentage<CALC extends boolean = boolean>
    extends Value<"length-percentage", CALC, "length"> {
    hasCalculation(): this is Calculated;
    resolve(resolver: Resolver): Canonical;
  }

  // In order to resolve a length, we need to know how to resolve relative
  // lengths.
  // Absolute lengths are just translated into another absolute unit.
  // Math expression have their own resolver, using this one when encountering
  // a relative length.
  export type Resolver = {
    length: Mapper<Length.Fixed<Unit.Length.Relative>, Canonical>;
    percentageBase: Canonical;
  };

  export function isLengthPercentage(
    value: unknown
  ): value is LengthPercentage {
    return (
      value instanceof Calculated ||
      value instanceof Length.Fixed ||
      value instanceof Percentage.Fixed
    );
  }

  export function isCalculated(value: unknown): value is Calculated {
    return value instanceof Calculated;
  }

  export function isFixed(value: unknown): value is Length.Fixed {
    return value instanceof Length.Fixed;
  }

  export function isPercentage(value: unknown): value is Percentage.Fixed {
    return value instanceof Percentage.Fixed;
  }

  export function of<U extends Unit.Length>(
    value: number,
    unit: U
  ): Length.Fixed<U>;

  export function of<U extends Unit.Length>(
    value: BaseLength<U>
  ): Length.Fixed<U>;

  export function of(value: number): Percentage.Fixed;

  export function of(value: BasePercentage): Percentage.Fixed;

  export function of(value: Math<"length-percentage">): Calculated;

  export function of<U extends Unit.Length>(
    value: number | BaseLength<U> | BasePercentage | Math<"length-percentage">,
    unit?: U
  ): LengthPercentage<U> {
    if (typeof value === "number") {
      if (unit === undefined) {
        return Percentage.Fixed.of(value);
      } else {
        return Length.Fixed.of(value, unit);
      }
    }

    if (BaseLength.isLength(value)) {
      return Length.Fixed.of(value.value, value.unit);
    }

    if (BasePercentage.isPercentage(value)) {
      return Percentage.Fixed.of(value.value);
    }

    return Calculated.of(value);
  }

  /**
   * {@link https://drafts.csswg.org/css-values/#lengths}
   */
  export const parse: Parser<Slice<Token>, LengthPercentage, string> = either(
    map<Slice<Token>, BaseLength, LengthPercentage, string>(
      BaseLength.parse,
      of
    ),
    map<Slice<Token>, BasePercentage, LengthPercentage, string>(
      BasePercentage.parse,
      of
    ),
    map(Math.parseLengthPercentage, of)
  );
}
