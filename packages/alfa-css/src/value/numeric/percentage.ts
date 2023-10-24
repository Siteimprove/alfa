import { Parser } from "@siteimprove/alfa-parser";
import { Selective } from "@siteimprove/alfa-selective";
import { Slice } from "@siteimprove/alfa-slice";

import { Math } from "../../calculation";
import {
  Numeric as BaseNumeric,
  Percentage as BasePercentage,
} from "../../calculation/numeric";

import { type Parser as CSSParser, Token } from "../../syntax";

import { Resolvable } from "../resolvable";

import type { Angle } from "./angle";
import type { Integer } from "./integer";
import type { Length } from "./length";
import type { Number } from "./number";
import { Numeric } from "./numeric";

const { either, map } = Parser;

/**
 * {@link https://drafts.csswg.org/css-values/#numbers}
 *
 * @public
 */
export type Percentage<R extends BaseNumeric.Type = BaseNumeric.Type> =
  | Percentage.Calculated<R>
  | Percentage.Fixed<R>;

/**
 * {@link https://drafts.csswg.org/css-values/#numbers}
 *
 * @public
 */
export namespace Percentage {
  export type Canonical = Fixed;

  /**
   * Percentages that are the result of a calculation.
   */
  export class Calculated<R extends BaseNumeric.Type = BaseNumeric.Type>
    extends Numeric.Calculated<"percentage", "percentage" | R>
    implements Resolvable<Canonical | Canonicals[R], Resolver<R>>
  {
    public static of(value: Math<"percentage">): Calculated {
      return new Calculated(value);
    }

    private constructor(math: Math<"percentage">) {
      super(math, "percentage");
    }

    public hasCalculation(): this is Calculated<R> {
      return true;
    }

    public resolve(): Fixed<"percentage">;

    public resolve<T extends Numeric.Fixed<R>>(resolver: Resolver<R>): T;

    public resolve<T extends Numeric.Fixed<R>>(
      resolver?: Resolver<R>,
    ): Fixed<R> | T {
      const percentage = Fixed.of<R>(
        this._math
          .resolve()
          // Since the expression has been correctly typed, it should always resolve.
          .getUnsafe(`Could not fully resolve ${this} as a percentage`),
      );
      return resolver === undefined
        ? percentage
        : // since we don't know much about percentageBase, scale defaults to
          // the abstract one on Numeric and loses its actual type which needs
          // to be asserted again.
          (resolver.percentageBase.scale(percentage.value) as T);
    }

    public equals(value: unknown): value is this {
      return value instanceof Calculated && super.equals(value);
    }

    public toJSON(): Calculated.JSON {
      return super.toJSON();
    }
  }

  /**
   * @public
   */
  export namespace Calculated {
    export interface JSON extends Numeric.Calculated.JSON<"percentage"> {}
  }

  /**
   * Percentages that are a fixed (not calculated) value.
   */
  export class Fixed<R extends BaseNumeric.Type = BaseNumeric.Type>
    extends Numeric.Fixed<"percentage", "percentage" | R>
    implements Resolvable<Canonical | Canonicals[R], Resolver<R>>
  {
    public static of<R extends BaseNumeric.Type = BaseNumeric.Type>(
      value: number | BasePercentage,
    ): Fixed<R> {
      return new Fixed(
        BasePercentage.isPercentage(value) ? value.value : value,
      );
    }

    private constructor(value: number) {
      super(value, "percentage");
    }

    public resolve(): Fixed<"percentage">;

    public resolve<T extends Numeric.Fixed<R>>(resolver: Resolver<R>): T;

    public resolve<T extends Numeric.Fixed<R>>(
      resolver?: Resolver<R>,
    ): Fixed<"percentage"> | T {
      return resolver === undefined
        ? (this as Fixed<"percentage">)
        : // since we don't know much about percentageBase, scale defaults to
          // the abstract one on Numeric and loses its actual type which needs
          // to be asserted again.
          (resolver.percentageBase.scale(this._value) as T);
    }

    public scale(factor: number): Fixed<R> {
      return new Fixed(this._value * factor);
    }

    public equals(value: unknown): value is this {
      return value instanceof Fixed && super.equals(value);
    }

    public toJSON(): Fixed.JSON {
      return super.toJSON();
    }

    public toString(): string {
      return `${this._value * 100}%`;
    }
  }

  /**
   * @public
   */
  export namespace Fixed {
    export interface JSON extends Numeric.Fixed.JSON<"percentage"> {}
  }

  export interface Resolver<R extends BaseNumeric.Type> {
    percentageBase: Canonicals[R];
  }

  export function isCalculated(value: unknown): value is Calculated {
    return value instanceof Calculated;
  }

  export function isFixed(value: unknown): value is Fixed {
    return value instanceof Fixed;
  }

  export function isPercentage(value: unknown): value is Percentage {
    return value instanceof Calculated || value instanceof Fixed;
  }

  export function of(value: number): Fixed;

  export function of(value: BasePercentage): Fixed;

  export function of(value: Math<"percentage">): Calculated;

  export function of(
    value: number | BasePercentage | Math<"percentage">,
  ): Percentage {
    return Selective.of(value)
      .if(Math.isPercentage, Calculated.of)
      .else(Fixed.of)
      .get();
  }

  /**
   * {@link https://drafts.csswg.org/css-values/#number-value}
   */
  export const parse: CSSParser<Percentage> = either(
    map<Slice<Token>, BasePercentage, Fixed, string>(BasePercentage.parse, of),
    map(Math.parsePercentage, of),
  );
}

type Canonicals = {
  integer: Integer.Canonical;
  number: Number.Canonical;
  percentage: Percentage.Canonical;
  angle: Angle.Canonical;
  length: Length.Canonical;
};
