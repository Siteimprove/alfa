import { Parser } from "@siteimprove/alfa-parser";
import { Selective } from "@siteimprove/alfa-selective";
import type { Slice } from "@siteimprove/alfa-slice";

import { Math } from "../../calculation/index.js";
import * as Base from "../../calculation/numeric/index.js";
import type { Token } from "../../syntax/index.js";
import { type Parser as CSSParser } from "../../syntax/index.js";
import type { Unit } from "../../unit/index.js";

import type { PartiallyResolvable, Resolvable } from "../resolvable.js";

import { Dimension } from "./dimension.js";
import { Length } from "./length.js";
import type { Numeric } from "./numeric.js";
import { Percentage } from "./percentage.js";

const { either, map } = Parser;

/**
 * @public
 */
export type LengthPercentage<U extends Unit.Length = Unit.Length> =
  | LengthPercentage.Calculated
  | Length.Calculated
  | Length.Fixed<U>
  | Percentage.Calculated<"length">
  | Percentage.Fixed<"length">;

/**
 * @public
 */
export namespace LengthPercentage {
  export type Canonical = Length.Canonical;
  /**
   * Some percentages are resolved against boxes dimensions which we do not
   * always have access to at compute time.
   */
  export type PartiallyResolved =
    | Canonical
    | Percentage.PartiallyResolved<"length">
    | LengthPercentage.Calculated;

  /**
   * Length-percentages that are the result of a calculation.
   */
  export class Calculated
    extends Dimension.Calculated<"length-percentage">
    implements
      Resolvable<Length.Canonical, Resolver>,
      PartiallyResolvable<Calculated, PartialResolver>
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

    public resolve(resolver: Resolver & Numeric.GenericResolver): Canonical {
      const resolve = this._math.resolve({
        ...Length.toExpressionResolver(resolver),
        ...Percentage.toExpressionResolver<
          "length",
          Base.Length<Unit.Length.Canonical>
        >(resolver),
      });
      return Length.Fixed.of(
        resolve
          // Since the expression has been correctly typed, it should always resolve.
          .getUnsafe(`Could not resolve ${this._math} as a length`),
      );
    }

    public partiallyResolve(resolver: PartialResolver): this {
      return this;
    }

    public equals(value: unknown): value is this {
      return value instanceof Calculated && super.equals(value);
    }
  }

  export namespace Calculated {
    export interface JSON
      extends Dimension.Calculated.JSON<"length-percentage"> {}
  }

  export type JSON =
    | Calculated.JSON
    | Length.Calculated.JSON
    | Length.Fixed.JSON
    | Percentage.Calculated.JSON
    | Percentage.Fixed.JSON;

  // In order to resolve a percentage, we need a base (=100%)
  // In order to resolve a length, we need to know how to resolve relative
  // lengths.
  // Absolute lengths are just translated into another absolute unit.
  // Math expression have their own resolver, using this one when encountering
  // a relative length.
  export type Resolver = Length.Resolver & Percentage.Resolver<"length">;

  export type PartialResolver = Length.Resolver;

  /**
   * Fully resolves a length-percentage, when a full resolver is provided.
   */
  export function resolve(
    resolver: Resolver & Numeric.GenericResolver,
  ): (value: LengthPercentage) => Canonical {
    return (value) => {
      // We need to break down the union to help TS find the correct overload
      // of each component and correctly narrow the result.
      return Percentage.isPercentage(value)
        ? value.resolve(resolver)
        : value.resolve(resolver);
    };
  }

  /**
   * Partially resolves a length-percentage, when only a length resolver is
   * provided.
   *
   * @remarks
   * For many style properties, the percentages are resolved depending on the
   * dimensions of the box, which we do not always have. In this case, we
   * cannot resolve the percentage parts, but we can still fully resolve the
   * length parts. Calculated percentages cannot be fully resolved into a
   * canonical length, but we can nonetheless reduce them to a pure percentage.
   * However, mixed calculations have to stay as they are.
   */
  export function partiallyResolve(
    resolver: PartialResolver,
  ): (value: LengthPercentage) => PartiallyResolved {
    return (value) =>
      Selective.of(value)
        .if(Length.isLength, (value) => value.resolve(resolver))
        .if(Percentage.isPercentage, (value) => value.partiallyResolve())
        .get();
  }

  export function isLengthPercentage(
    value: unknown,
  ): value is LengthPercentage {
    return (
      value instanceof Calculated ||
      Length.isLength(value) ||
      Percentage.isPercentage(value)
    );
  }

  export function isCalculated(
    value: unknown,
  ): value is Calculated | Length.Calculated | Percentage.Calculated {
    return (
      value instanceof Calculated ||
      Length.isCalculated(value) ||
      Percentage.isCalculated(value)
    );
  }

  export function isFixed(value: unknown): value is Length.Fixed {
    return value instanceof Length.Fixed;
  }

  export function isPercentage(value: unknown): value is Percentage.Fixed {
    return value instanceof Percentage.Fixed;
  }

  export function of<U extends Unit.Length>(
    value: number,
    unit: U,
  ): Length.Fixed<U>;

  export function of<U extends Unit.Length>(
    value: Base.Length<U>,
  ): Length.Fixed<U>;

  export function of(value: number): Percentage.Fixed;

  export function of(value: Base.Percentage): Percentage.Fixed;

  export function of(value: Math<"length">): Length.Calculated;

  export function of(value: Math<"length-percentage">): Calculated;

  export function of(value: Math<"percentage">): Percentage.Calculated;

  export function of<U extends Unit.Length>(
    value:
      | number
      | Base.Length<U>
      | Base.Percentage
      | Math<"length">
      | Math<"length-percentage">
      | Math<"percentage">,
    unit?: U,
  ): LengthPercentage<U> {
    if (typeof value === "number") {
      if (unit === undefined) {
        return Percentage.of(value);
      } else {
        return Length.of(value, unit);
      }
    }

    if (Base.Length.isLength(value)) {
      return Length.of(value.value, value.unit);
    }

    if (Base.Percentage.isPercentage(value)) {
      return Percentage.of(value.value);
    }

    // value must be a math expression

    if (value.isPercentage()) {
      return Percentage.of(value);
    }

    if (value.isDimension("length")) {
      return Length.of(value);
    }

    return Calculated.of(value);
  }

  /**
   * {@link https://drafts.csswg.org/css-values/#lengths}
   */
  export const parse: CSSParser<LengthPercentage> = either<
    Slice<Token>,
    LengthPercentage,
    string
  >(
    Length.parse,
    Percentage.parse<"length">,
    map<Slice<Token>, Math<"length-percentage">, Calculated, string>(
      Math.parseLengthPercentage,
      of,
    ),
  );
}
