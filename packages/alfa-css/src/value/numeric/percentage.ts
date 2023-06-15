import { Parser } from "@siteimprove/alfa-parser";
import { Selective } from "@siteimprove/alfa-selective";
import { Slice } from "@siteimprove/alfa-slice";

import { Math } from "../../calculation";
import { Percentage as BasePercentage } from "../../calculation/numeric";

import { Value } from "../../value";

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
  /**
   * Percentages that may contain calculations.
   *
   * @remarks
   * We actually guarantee that these **do** contain a calculation.
   *
   * @public
   */
  export class Calculated
    extends Numeric.Calculated<"percentage">
    implements IPercentage<true>
  {
    public static of(value: Math<"percentage">): Calculated {
      return new Calculated(value);
    }

    private constructor(math: Math<"percentage">) {
      super(math, "percentage");
    }

    public resolve(): Fixed {
      return Fixed.of(
        this._math
          .resolve2()
          // Since the expression has been correctly typed, it should always resolve.
          .getUnsafe(`Could not fully resolve ${this} as a percentage`)
      );
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
   * Percentages that are guaranteed to not contain any calculation.
   *
   * @public
   */
  export class Fixed
    extends Numeric.Fixed<"percentage">
    implements IPercentage<false>
  {
    public static of(value: number | BasePercentage): Fixed {
      return new Fixed(
        BasePercentage.isPercentage(value) ? value.value : value
      );
    }

    private constructor(value: number) {
      super(value, "percentage");
    }

    public resolve(): this {
      return this;
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
  }

  /**
   * @public
   */
  export namespace Fixed {
    export interface JSON extends Numeric.Fixed.JSON<"percentage"> {}
  }

  /**
   * @remarks
   * While hasCalculated and resolve are already defined on Numeric, they have
   * a stricter type for Number. Hence, having an interface is more convenient
   * to record that type.
   */
  interface IPercentage<CALC extends boolean = boolean>
    extends Value<"percentage", CALC> {
    hasCalculation(): this is Calculated;
    resolve(): Fixed;
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
  export const parseBase: Parser<Slice<Token>, Fixed, string> = map<
    Slice<Token>,
    BasePercentage,
    Fixed,
    string
  >(BasePercentage.parse, of);
}
