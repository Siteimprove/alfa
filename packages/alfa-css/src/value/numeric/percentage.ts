import { Parser } from "@siteimprove/alfa-parser";
import { Selective } from "@siteimprove/alfa-selective";
import { Slice } from "@siteimprove/alfa-slice";

import { Math } from "../../calculation";
import {
  Numeric as BaseNumeric,
  Percentage as BasePercentage,
} from "../../calculation/numeric";

import { Value } from "../value";

import { Numeric } from "./numeric";
import { Token } from "../../syntax";

const { either, map } = Parser;

/**
 * {@link https://drafts.csswg.org/css-values/#numbers}
 *
 * @public
 */
export type Percentage = Percentage.Calculated | Percentage.Fixed;

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
    implements IPercentage<true, R>
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

    public resolve(base: Numeric.Fixed<R>): Numeric.Fixed<R>;

    public resolve(base?: Numeric.Fixed<R>): Fixed | Numeric.Fixed<R> {
      const percentage = Fixed.of(
        this._math
          .resolve()
          // Since the expression has been correctly typed, it should always resolve.
          .getUnsafe(`Could not fully resolve ${this} as a percentage`)
      );
      return base === undefined ? percentage : base.scale(percentage.value);
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
    implements IPercentage<false, R>
  {
    public static of(value: number | BasePercentage): Fixed {
      return new Fixed(
        BasePercentage.isPercentage(value) ? value.value : value
      );
    }

    private constructor(value: number) {
      super(value, "percentage");
    }

    public resolve(): Fixed<"percentage">;

    public resolve(base: Numeric.Fixed<R>): Numeric.Fixed<R>;

    public resolve(
      base?: Numeric.Fixed<R>
    ): Fixed<"percentage"> | Numeric.Fixed<R> {
      return base === undefined ? this : base.scale(this._value);
    }

    public scale(factor: number): Fixed {
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

  interface IPercentage<
    CALC extends boolean = boolean,
    R extends BaseNumeric.Type = BaseNumeric.Type
  > extends Value<"percentage", CALC, "percentage" | R> {
    hasCalculation(): this is Calculated<R>;
    resolve(): Fixed<"percentage" | R>;
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
    value: number | BasePercentage | Math<"percentage">
  ): Percentage {
    return Selective.of(value)
      .if(Math.isPercentage, Calculated.of)
      .else(Fixed.of)
      .get();
  }

  /**
   * {@link https://drafts.csswg.org/css-values/#number-value}
   */
  export const parse: Parser<Slice<Token>, Percentage, string> = either(
    map<Slice<Token>, BasePercentage, Fixed, string>(BasePercentage.parse, of),
    map(Math.parsePercentage, of)
  );

  // TODO: temporary helper needed during migration
  /**
   * @internal
   */
  export const parseBase: Parser<Slice<Token>, Fixed, string> = map<
    Slice<Token>,
    BasePercentage,
    Fixed,
    string
  >(BasePercentage.parse, of);
}
