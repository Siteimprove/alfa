import { Parser } from "@siteimprove/alfa-parser";
import { Selective } from "@siteimprove/alfa-selective";
import { Slice } from "@siteimprove/alfa-slice";

import { Math } from "../../calculation/index.js";
import { Number as BaseNumber } from "../../calculation/numeric/index.js";
import { type Parser as CSSParser, Token } from "../../syntax/index.js";

import type { Resolvable } from "../resolvable.js";
import { Length } from "./length.js";

import { Numeric } from "./numeric.js";

const { either, map } = Parser;

/**
 * {@link https://drafts.csswg.org/css-values/#numbers}
 *
 * @public
 */
export type Number = Number.Calculated | Number.Fixed;

/**
 * {@link https://drafts.csswg.org/css-values/#numbers}
 *
 * @public
 */
export namespace Number {
  export type Canonical = Fixed;

  /**
   * Numbers that are the result of a calculation.
   */
  export class Calculated
    extends Numeric.Calculated<"number">
    implements Resolvable<Canonical, never>
  {
    public static of(value: Math<"number">): Calculated {
      return new Calculated(value);
    }

    private constructor(value: Math<"number">) {
      super(value, "number");
    }

    public resolve(resolver?: Numeric.GenericResolver): Canonical {
      return Fixed.of(
        this._math
          .resolve(Length.toExpressionResolver(resolver))
          // Since the expression has been correctly typed, it should always resolve.
          .getUnsafe(`Could not fully resolve ${this} as a number`),
      );
    }

    public partiallyResolve(resolver?: Numeric.GenericResolver): Canonical {
      return this.resolve(resolver);
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
    export interface JSON extends Numeric.Calculated.JSON<"number"> {}
  }

  /**
   * Numbers that are a fixed (not calculated) value.
   */
  export class Fixed
    extends Numeric.Fixed<"number">
    implements Resolvable<Canonical, never>
  {
    public static of(value: number | BaseNumber): Fixed {
      return new Fixed(BaseNumber.isNumber(value) ? value.value : value);
    }

    private constructor(value: number) {
      super(value, "number");
    }

    public resolve(): this {
      return this;
    }

    public partiallyResolve(): this {
      return this;
    }

    public scale(factor: number): Fixed {
      return new Fixed(this._value * factor);
    }

    /**
     * @internal
     */
    public toBase(): BaseNumber {
      return BaseNumber.of(this._value);
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
    export interface JSON extends Numeric.Fixed.JSON<"number"> {}
  }

  export function isCalculated(value: unknown): value is Calculated {
    return value instanceof Calculated;
  }

  export function isFixed(value: unknown): value is Fixed {
    return value instanceof Fixed;
  }

  export function isNumber(value: unknown): value is Number {
    return value instanceof Calculated || value instanceof Fixed;
  }

  export function of(value: number): Fixed;

  export function of(value: BaseNumber): Fixed;

  export function of(value: Math<"number">): Calculated;

  export function of(value: number | BaseNumber | Math<"number">): Number {
    return Selective.of(value)
      .if(Math.isNumber, Calculated.of)
      .else(Fixed.of)
      .get();
  }

  /**
   * {@link https://drafts.csswg.org/css-values/#number-value}
   */
  export const parse: CSSParser<Number> = either(
    map<Slice<Token>, BaseNumber, Fixed, string>(BaseNumber.parse, of),
    map(Math.parseNumber, of),
  );

  /**
   * @remarks
   * Zero values must be true 0, not calculations evaluating to 0.
   *
   * {@link https://drafts.csswg.org/css-values/#zero-value}
   */
  export const parseZero: CSSParser<Fixed> = map<
    Slice<Token>,
    BaseNumber,
    Fixed,
    string
  >(BaseNumber.parseZero, of);
}
