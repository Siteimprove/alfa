import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Math } from "../../calculation";
import { Number as BaseNumber } from "../../calculation/numeric/index-new";
import { Token } from "../../syntax";
import { Value } from "../../value";

import { Dimension } from "./dimension";
import { Numeric } from "./numeric";

const { either, map } = Parser;

/**
 * {@link https://drafts.csswg.org/css-values/#numbers}
 *
 * @public
 */
export type Angle = Angle.Calculated | Angle.Fixed;

/**
 * {@link https://drafts.csswg.org/css-values/#numbers}
 *
 * @public
 */
export namespace Angle {
  /**
   * Angles that may contain calculations.
   *
   * @remarks
   * We actually guarantee that these **do** contain a calculation.
   *
   * @public
   */
  export class Calculated
    extends Numeric.Calculated<"angle">
    implements IAngle<true>
  {
    public static of(value: Math<"angle">): Calculated {
      return new Calculated(value);
    }

    private constructor(value: Math<"angle">) {
      super(value, "angle");
    }

    public resolve(): Fixed {
      return Fixed.of(0);
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
    export interface JSON extends Numeric.Calculated.JSON<"angle"> {}
  }

  /**
   * Numbers that are guaranteed to not contain any calculation.
   *
   * @public
   */
  export class Fixed extends Numeric.Fixed<"angle"> implements IAngle<false> {
    public static of(value: number | BaseNumber): Fixed {
      return new Fixed(BaseNumber.isNumber(value) ? value.value : value);
    }

    private constructor(value: number) {
      super(value, "angle");
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
    export interface JSON extends Numeric.Fixed.JSON<"angle"> {}
  }

  /**
   * @remarks
   * While hasCalculated and resolve are already defined on Numeric, they have
   * a stricter type for Number. Hence, having an interface is more convenient
   * to record that type.
   */
  interface IAngle<CALC extends boolean = boolean>
    extends Value<"angle", CALC> {
    hasCalculation(): this is Calculated;
    resolve(): Fixed;
  }

  export function isCalculated(value: unknown): value is Calculated {
    return value instanceof Calculated;
  }

  export function isFixed(value: unknown): value is Fixed {
    return value instanceof Fixed;
  }

  export function isAngle(value: unknown): value is Angle {
    return value instanceof Calculated || value instanceof Fixed;
  }

  export function of(value: number): Fixed;

  export function of(value: BaseNumber): Fixed;

  export function of(value: Math<"angle">): Calculated;

  export function of(value: number | BaseNumber | Math<"angle">): Angle {
    return Fixed.of(0);
  }

  /**
   * {@link https://drafts.csswg.org/css-values/#number-value}
   */
  export const parse: Parser<Slice<Token>, Angle, string> = either(
    map<Slice<Token>, BaseNumber, Fixed, string>(BaseNumber.parse, of),
    map(Math.parseAngle, of)
  );

  // TODO: temporary helper needed during migration
  export const parseBase: Parser<Slice<Token>, Fixed, string> = map<
    Slice<Token>,
    BaseNumber,
    Fixed,
    string
  >(BaseNumber.parse, of);
}
