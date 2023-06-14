import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Selective } from "@siteimprove/alfa-selective";
import { Slice } from "@siteimprove/alfa-slice";

// We need to rename Math to avoid collision with the global namespace.
import { Math as Calculation } from "../../calculation";
import { Integer as BaseInteger } from "../../calculation/numeric/index-new";

import { Value } from "../../value";

import { Numeric } from "./numeric";
import { Token } from "../../syntax";

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
  /**
   * Integers that may contain calculations.
   *
   * @remarks
   * We actually guarantee that these **do** contain a calculation.
   *
   * @public
   */
  export class Calculated
    extends Numeric.Calculated<"number">
    implements IInteger<true>
  {
    public static of(value: Calculation<"number">): Calculated {
      return new Calculated(value);
    }

    private constructor(value: Calculation<"number">) {
      super(value, "number");
    }

    /**
     * @remarks
     * Numbers are rounded to the nearest integer upon resolving calculation
     *
     * {@link https://drafts.csswg.org/css-values/#calc-type-checking}
     */
    public resolve(): Fixed {
      return Fixed.of(
        this._math
          .resolve2()
          // Since the expression has been correctly typed, it should always resolve.
          .getUnsafe(`Could not fully resolve ${this} as a number`).value
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
    export interface JSON extends Numeric.Calculated.JSON<"number"> {}
  }

  /**
   * Numbers that are guaranteed to not contain any calculation.
   *
   * @public
   */
  export class Fixed
    extends Numeric.Fixed<"number">
    implements IInteger<false>
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
            Math.round(value) | 0
      );
    }

    private constructor(value: number) {
      super(value, "number");
    }

    public scale(factor: number): Fixed {
      return new Fixed(this._value * factor);
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
    export interface JSON extends Numeric.Fixed.JSON<"number"> {}
  }

  /**
   * @remarks
   * While hasCalculated and resolve are already defined on Numeric, they have
   * a stricter type for Number. Hence, having an interface is more convenient
   * to record that type.
   */
  interface IInteger<CALC extends boolean = boolean>
    extends Value<"number", CALC> {
    hasCalculation(): this is Calculated;
    resolve(): Fixed;
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
    value: number | BaseInteger | Calculation<"number">
  ): Integer {
    return Selective.of(value)
      .if(Calculation.isNumber, Calculated.of)
      .else(Fixed.of)
      .get();
  }

  /**
   * {@link https://drafts.csswg.org/css-values/#number-value}
   */
  export const parse: Parser<Slice<Token>, Integer, string> = either(
    map<Slice<Token>, BaseInteger, Fixed, string>(BaseInteger.parse, of),
    map(Calculation.parseNumber, of)
  );

  // TODO: temporary helper needed during migration
  export const parseBase: Parser<Slice<Token>, Fixed, string> = map<
    Slice<Token>,
    BaseInteger,
    Fixed,
    string
  >(BaseInteger.parse, of);
}
