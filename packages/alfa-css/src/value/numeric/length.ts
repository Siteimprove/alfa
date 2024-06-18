import { Comparable } from "@siteimprove/alfa-comparable";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { type Expression, Math } from "../../calculation";
import { Length as BaseLength } from "../../calculation/numeric";
import { type Parser as CSSParser, Token } from "../../syntax";
import { Converter, Unit } from "../../unit";

import { Resolvable } from "../resolvable";

import { Dimension } from "./dimension";
import type { Numeric } from "./numeric";

const { either, map } = Parser;

/**
 * @public
 */
export type Length<U extends Unit.Length = Unit.Length> =
  | Length.Calculated
  | Length.Fixed<U>;

/**
 * @public
 */
export namespace Length {
  export type Canonical = Fixed<Unit.Length.Canonical>;

  /**
   * Lengths that are the result of a calculation.
   */
  export class Calculated
    extends Dimension.Calculated<"length">
    implements Resolvable<Canonical, Resolver>
  {
    public static of(value: Math<"length">): Calculated {
      return new Calculated(value);
    }

    private constructor(math: Math<"length">) {
      super(math, "length");
    }

    public hasCalculation(): this is Calculated {
      return true;
    }

    public resolve(resolver: Resolver & Numeric.GenericResolver): Canonical {
      return Fixed.of(
        this._math
          .resolve(toExpressionResolver(resolver))
          // Since the expression has been correctly typed, it should always resolve.
          .getUnsafe(`Could not resolve ${this._math} as a length`),
      );
    }

    public equals(value: unknown): value is this {
      return value instanceof Calculated && super.equals(value);
    }
  }

  export namespace Calculated {
    export interface JSON extends Dimension.Calculated.JSON<"length"> {}
  }

  /**
   * Lengths that are a fixed (not calculated) value.
   */
  export class Fixed<U extends Unit.Length = Unit.Length>
    extends Dimension.Fixed<"length", U>
    implements Resolvable<Canonical, Resolver>, Comparable<Fixed<U>>
  {
    public static of<U extends Unit.Length>(value: number, unit: U): Fixed<U>;

    public static of<U extends Unit.Length>(value: BaseLength<U>): Fixed<U>;

    public static of<U extends Unit.Length>(
      value: number | BaseLength<U>,
      unit?: U,
    ): Fixed<U> {
      if (typeof value === "number") {
        // The overloads ensure that unit is not undefined
        return new Fixed(value, unit!);
      }

      return new Fixed(value.value, value.unit);
    }

    private constructor(value: number, unit: U) {
      super(value, unit, "length");
    }

    public hasCalculation(): this is never {
      return false;
    }

    public hasUnit<U extends Unit.Length>(unit: U): this is Fixed<U> {
      return (this._unit as Unit.Length) === unit;
    }

    public withUnit<U extends Unit.Length>(unit: U): Fixed<U> {
      if (this.hasUnit(unit)) {
        return this;
      }

      if (Unit.isAbsoluteLength(unit) && Unit.isAbsoluteLength(this._unit)) {
        return Fixed.of(Converter.length(this._value, this._unit, unit), unit);
      }

      throw new Error(`Cannot convert ${this._unit} to ${unit}`);
    }

    public isRelative(): this is Fixed<Unit.Length.Relative> {
      return Unit.isRelativeLength(this._unit);
    }

    public isFontRelative(): this is Fixed<Unit.Length.Relative.Font> {
      return Unit.isFontRelativeLength(this._unit);
    }

    public isViewportRelative(): this is Fixed<Unit.Length.Relative.Viewport> {
      return Unit.isViewportRelativeLength(this._unit);
    }

    public isAbsolute(): this is Fixed<Unit.Length.Absolute> {
      return Unit.isAbsoluteLength(this._unit);
    }

    public scale(factor: number): Fixed<U> {
      return new Fixed(this._value * factor, this._unit);
    }

    /**
     * Resolve a Length into an absolute Length in pixels.
     */
    public resolve(resolver: Resolver): Canonical {
      return this.isRelative()
        ? resolver.length(this)
        : this.withUnit(Unit.Length.Canonical);
    }

    /**
     * @internal
     */
    public toBase(): BaseLength<U> {
      return BaseLength.of(this._value, this._unit);
    }

    public equals(value: unknown): value is this {
      return value instanceof Fixed && super.equals(value);
    }
  }

  export namespace Fixed {
    export interface JSON<U extends Unit.Length = Unit.Length>
      extends Dimension.Fixed.JSON<"length", U> {}
  }

  export type JSON = Calculated.JSON | Fixed.JSON;

  // In order to resolve a length, we need to know how to resolve relative
  // lengths.
  // Absolute lengths are just translated into another absolute unit.
  // Math expression have their own resolver, using this one when encountering
  // a relative length.
  export interface Resolver {
    length: Mapper<Fixed<Unit.Length.Relative>, Canonical>;
  }

  /**
   * @internal
   */
  export function toExpressionResolver(
    resolver: Resolver,
  ): Expression.LengthResolver;

  /**
   * @internal
   */
  export function toExpressionResolver(resolver: any): {};

  /**
   * @internal
   */
  export function toExpressionResolver(
    resolver?: Partial<Resolver>,
  ): Partial<Expression.LengthResolver> {
    return resolver?.length === undefined
      ? {}
      : { length: (length) => resolver.length!(Fixed.of(length)).toBase() };
  }

  /**
   * Build a (fixed) length resolver, using basis for the relative units
   */
  export function resolver(
    emBase: Canonical,
    remBase: Canonical,
    vwBase: Canonical,
    vhBase: Canonical,
  ): Mapper<Fixed<Unit.Length.Relative>, Canonical> {
    return (length) => {
      const { unit, value } = length;
      const [min, max] =
        vhBase.value < vwBase.value ? [vhBase, vwBase] : [vwBase, vhBase];

      switch (unit) {
        // https://www.w3.org/TR/css-values/#em
        case "em":
          return emBase.scale(value);

        // https://www.w3.org/TR/css-values/#rem
        case "rem": {
          return remBase.scale(value);
        }

        // https://www.w3.org/TR/css-values/#ex
        case "ex":
        // https://www.w3.org/TR/css-values/#ch
        case "ch":
          return emBase.scale(value * 0.5);

        // https://www.w3.org/TR/css-values/#vh
        case "vh":
          return vhBase.scale(value / 100);

        // https://www.w3.org/TR/css-values/#vw
        case "vw":
          return vwBase.scale(value / 100);

        // https://www.w3.org/TR/css-values/#vmin
        case "vmin":
          return min.scale(value / 100);

        // https://www.w3.org/TR/css-values/#vmax
        case "vmax":
          return max.scale(value / 100);
      }
    };
  }

  export function isLength(value: unknown): value is Length {
    return value instanceof Calculated || value instanceof Fixed;
  }

  export function isCalculated(value: unknown): value is Calculated {
    return value instanceof Calculated;
  }

  export function isFixed(value: unknown): value is Fixed {
    return value instanceof Fixed;
  }

  export function of<U extends Unit.Length>(value: number, unit: U): Fixed<U>;

  export function of<U extends Unit.Length>(value: BaseLength<U>): Fixed<U>;

  export function of(value: Math<"length">): Calculated;

  export function of<U extends Unit.Length>(
    value: number | BaseLength<U> | Math<"length">,
    unit?: U,
  ): Length<U> {
    if (typeof value === "number") {
      // The overloads ensure that unit is not undefined
      return Fixed.of(value, unit!);
    }

    if (BaseLength.isLength(value)) {
      return Fixed.of(value.value, value.unit);
    }

    return Calculated.of(value);
  }

  /**
   * {@link https://drafts.csswg.org/css-values/#lengths}
   */
  export const parse: CSSParser<Length> = either(
    map<Slice<Token>, BaseLength, Fixed, string>(BaseLength.parse, of),
    map(Math.parseLength, of),
  );
}
