import type { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Selective } from "@siteimprove/alfa-selective";
import type { Slice } from "@siteimprove/alfa-slice";

// We need to rename Math to avoid collision with the global namespace.
import { Math as Calculation } from "../../calculation/index.js";
import { Integer as BaseInteger } from "../../calculation/numeric/index.js";
import type { Token } from "../../syntax/index.js";
import { type Parser as CSSParser } from "../../syntax/index.js";

import type { Resolvable } from "../resolvable.js";
import { Length } from "./length.js";

import { Numeric } from "./numeric.js";

const { either, map } = Parser;

/**
 * {@link https://drafts.csswg.org/css-values/#integers}
 *
 * @public
 */
export type Integer = Integer.Calculated | Integer.Fixed;

/**
 * {@link https://drafts.csswg.org/css-values/#integers}
 *
 * @public
 */
export namespace Integer {
  export type Canonical = Fixed;

  /**
   * Integers that are the result of a calculation.
   */
  export class Calculated
    extends Numeric.Calculated<"integer">
    implements Resolvable<Canonical, never>
  {
    public static of(value: Calculation<"number">): Calculated {
      return new Calculated(value);
    }

    protected constructor(value: Calculation<"number">) {
      super(value, "integer");
    }

    /**
     * @remarks
     * Numbers are rounded to the nearest integer upon resolving calculation
     *
     * {@link https://drafts.csswg.org/css-values/#calc-type-checking}
     */
    public resolve(resolver?: Numeric.GenericResolver): Canonical {
      return Fixed.of(
        this._math
          .resolve(Length.toExpressionResolver(resolver))
          // Since the expression has been correctly typed, it should always resolve.
          .getUnsafe(`Could not fully resolve ${this} as a number`).value,
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
    export interface JSON extends Numeric.Calculated.JSON<"integer"> {}
  }

  /**
   * Numbers that are a fixed (not calculated) value.
   */
  export class Fixed
    extends Numeric.Fixed<"integer">
    implements Resolvable<Canonical, never>
  {
    /**
     * {@link https://drafts.csswg.org/css-values/#css-round-to-the-nearest-integer}
     */
    public static of(value: number | BaseInteger): Fixed {
      return new Fixed(
        BaseInteger.isInteger(value)
          ? value.value
          : // Math.round ensure the correct rounding.
            // The bitwise or ensure coercion to 32 bits integer
            Math.round(value) | 0,
      );
    }

    protected constructor(value: number) {
      super(value, "integer");
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
    public toBase(): BaseInteger {
      return BaseInteger.of(this._value);
    }

    public equals(value: unknown): value is this {
      return value instanceof Fixed && super.equals(value);
    }

    public hash(hash: Hash): void {
      hash.writeInt32(this._value);
    }

    public toJSON(): Fixed.JSON {
      return super.toJSON();
    }
  }

  /**
   * @public
   */
  export namespace Fixed {
    export interface JSON extends Numeric.Fixed.JSON<"integer"> {}
  }

  export function isCalculated(value: unknown): value is Calculated {
    return value instanceof Calculated;
  }

  export function isFixed(value: unknown): value is Fixed {
    return value instanceof Fixed;
  }

  export function isInteger(value: unknown): value is Integer {
    return value instanceof Calculated || value instanceof Fixed;
  }

  export function of(value: number): Fixed;

  export function of(value: BaseInteger): Fixed;

  export function of(value: Calculation<"number">): Calculated;

  export function of(
    value: number | BaseInteger | Calculation<"number">,
  ): Integer {
    return Selective.of(value)
      .if(Calculation.isNumber, Calculated.of)
      .else(Fixed.of)
      .get();
  }

  /**
   * {@link https://drafts.csswg.org/css-values/#number-value}
   */
  export const parse: CSSParser<Integer> = either(
    map<Slice<Token>, BaseInteger, Fixed, string>(BaseInteger.parse, of),
    map(Calculation.parseNumber, of),
  );
}
