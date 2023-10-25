import { Parser } from "@siteimprove/alfa-parser";
import { Selective } from "@siteimprove/alfa-selective";
import { Slice } from "@siteimprove/alfa-slice";

import { Math } from "../../calculation";
import {
  Numeric as BaseNumeric,
  Percentage as BasePercentage,
} from "../../calculation/numeric";

import { Token } from "../../syntax";

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
 * @remarks
 * Percentages, even if they do not contain a calc() function, act nearly as
 * calculated value. Given a percentage base (i.e., what is 100%), they can
 * resolve to a numeric value of that type.
 *
 * The Percentage type contains a type hint, H, that indicate into which type
 * this is intended to resolve. This is normally known at parse time (i.e., is
 * it a length?) This is only stored in the type and does not have any effect on
 * the computation.
 *
 * Calculated percentages can be partially resolved in the absence of a base,
 * they are then turned into a Fixed percentage with the same hint.
 *
 * Percentages that represent percentages (e.g., RGB components) are special kids
 * in the sense that their partial and full resolution are the same. This
 * requires resolve() to accept zero argument (no resolver) for them.
 *
 * @public
 */
export type Percentage<H extends BaseNumeric.Type = BaseNumeric.Type> =
  | Percentage.Calculated<H>
  | Percentage.Fixed<H>;

/**
 * {@link https://drafts.csswg.org/css-values/#numbers}
 *
 * @public
 */
export namespace Percentage {
  export type Canonical = Fixed;

  /**
   * Percentages that are the result of a calculation.
   *
   */
  export class Calculated<H extends BaseNumeric.Type = BaseNumeric.Type>
    extends Numeric.Calculated<"percentage", H>
    implements Resolvable<Canonicals[H], Resolver<H>>
  {
    public static of<H extends BaseNumeric.Type = BaseNumeric.Type>(
      value: Math<"percentage">,
    ): Calculated<H> {
      return new Calculated(value);
    }

    private constructor(math: Math<"percentage">) {
      super(math, "percentage");
    }

    public hasCalculation(): this is Calculated<H> {
      return true;
    }

    public resolve(): Canonical;

    public resolve<T extends Canonicals[H]>(resolver: Resolver<H>): T;

    public resolve<T extends Canonicals[H]>(
      resolver?: Resolver<H>,
    ): Canonical | T {
      const percentage = Fixed.of<H>(
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
  export class Fixed<H extends BaseNumeric.Type = BaseNumeric.Type>
    extends Numeric.Fixed<"percentage", "percentage" | H>
    implements Resolvable<Canonical | Canonicals[H], Resolver<H>>
  {
    public static of<H extends BaseNumeric.Type = BaseNumeric.Type>(
      value: number | BasePercentage,
    ): Fixed<H> {
      return new Fixed(
        BasePercentage.isPercentage(value) ? value.value : value,
      );
    }

    private constructor(value: number) {
      super(value, "percentage");
    }

    public resolve(): Canonical;

    public resolve<T extends Canonicals[H]>(resolver: Resolver<H>): T;

    public resolve<T extends Canonicals[H]>(
      resolver?: Resolver<H>,
    ): Canonical | T {
      return resolver === undefined
        ? (this as Canonical)
        : // since we don't know much about percentageBase, scale defaults to
          // the abstract one on Numeric and loses its actual type which needs
          // to be asserted again.
          (resolver.percentageBase.scale(this._value) as T);
    }

    public scale(factor: number): Fixed<H> {
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

  export type Resolver<H extends BaseNumeric.Type> = H extends "percentage"
    ? never
    : { percentageBase: Canonicals[H] };

  export type PartialResolver = never;

  export type PartiallyResolved<H extends BaseNumeric.Type> = Fixed<H>;

  export function partiallyResolve<H extends BaseNumeric.Type>(
    value: Percentage<H>,
  ): PartiallyResolved<H> {
    return isFixed(value)
      ? value
      : Fixed.of<H>(
          value.math
            .resolve()
            // Since the expression has been correctly typed, it should always resolve.
            .getUnsafe(`Could not resolve ${value} as a percentage`),
        );
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

  export function of<H extends BaseNumeric.Type = BaseNumeric.Type>(
    value: number,
  ): Fixed<H>;

  export function of<H extends BaseNumeric.Type = BaseNumeric.Type>(
    value: BasePercentage,
  ): Fixed<H>;

  export function of<H extends BaseNumeric.Type = BaseNumeric.Type>(
    value: Math<"percentage">,
  ): Calculated<H>;

  export function of<H extends BaseNumeric.Type>(
    value: number | BasePercentage | Math<"percentage">,
  ): Percentage<H> {
    return Selective.of(value)
      .if(Math.isPercentage, Calculated.of<H>)
      .else(Fixed.of<H>)
      .get();
  }

  /**
   * {@link https://drafts.csswg.org/css-values/#number-value}
   */
  export function parse<H extends BaseNumeric.Type = BaseNumeric.Type>(
    input: Slice<Token>,
  ) {
    return either(
      map<Slice<Token>, BasePercentage, Fixed<H>, string>(
        BasePercentage.parse,
        of<H>,
      ),
      map(Math.parsePercentage, of<H>),
    )(input);
  }
}

type Canonicals = {
  integer: Integer.Canonical;
  number: Number.Canonical;
  percentage: Percentage.Canonical;
  angle: Angle.Canonical;
  length: Length.Canonical;
};
