import { Comparable, Comparison } from "@siteimprove/alfa-comparable";
import { Hash } from "@siteimprove/alfa-hash";

import { Numeric as BaseNumeric } from "../../calculation/numeric";
import { Convertible, Unit } from "../../unit";
import { Value } from "../value";

import { Numeric } from "./numeric";

/**
 * @public
 */
export type Dimension<T extends Type = Type> =
  | Dimension.Calculated<T>
  | Dimension.Fixed<T>;

/**
 * @public
 */
export namespace Dimension {
  /**
   * Dimensions that are the result of a calculation.
   */
  export abstract class Calculated<T extends Type = Type>
    extends Numeric.Calculated<T>
    implements IDimension<T, true>
  {
    protected constructor(math: Numeric.ToMath<T>, type: T) {
      super(math, type);
    }

    public hasCalculation(): this is Calculated<T> {
      return true;
    }

    public abstract resolve(resolver?: unknown): Fixed<T, ToCanonical<T>>;

    public equals(value: unknown): value is this {
      return value instanceof Calculated && super.equals(value);
    }
  }

  export namespace Calculated {
    export interface JSON<T extends Type = Type>
      extends Numeric.Calculated.JSON<T> {}
  }

  /**
   * Dimensions that are a fixed (not calculated) value.
   */
  export abstract class Fixed<
      T extends Type = Type,
      // The actual unit in which the dimension is expressed, e.g px, em, rad, …
      U extends ToDimension<T> = ToDimension<T>
    >
    extends Numeric.Fixed<T>
    implements
      IDimension<T, false>,
      Convertible<ToDimension<T>>,
      Comparable<Fixed<T>>
  {
    protected readonly _unit: U;

    protected constructor(value: number, unit: U, type: T) {
      super(value, type);
      this._unit = unit;
    }

    public get unit(): U {
      return this._unit;
    }

    public hasCalculation(): this is Calculated<T> {
      return false;
    }

    /**
     * {@link https://drafts.csswg.org/css-values/#canonical-unit}
     */
    public get canonicalUnit(): ToCanonical<T> {
      // The this.type test does not correctly narrow T, so we need to force typing.
      return (this.type === "angle" ? "deg" : "px") as ToCanonical<T>;
    }

    public hasUnit<V extends ToDimension<T>>(unit: V): this is Fixed<T, V> {
      return (this._unit as ToDimension<T>) === unit;
    }

    public abstract withUnit<V extends ToDimension<T>>(unit: V): Fixed<T, V>;

    public abstract resolve(resolver?: unknown): Fixed<T, ToCanonical<T>>;

    public equals(value: unknown): value is this {
      return (
        value instanceof Fixed &&
        super.equals(value) &&
        value._unit === this._unit
      );
    }

    public compare(value: Fixed<T>): Comparison {
      const a = this.withUnit(this.canonicalUnit);
      const b = value.withUnit(value.canonicalUnit);

      return Comparable.compareNumber(a.value, b.value);
    }

    public hash(hash: Hash) {
      super.hash(hash);
      hash.writeString(this._unit);
    }

    public toJSON(): Fixed.JSON<T, U> {
      return { ...super.toJSON(), unit: this._unit };
    }

    public toString(): string {
      return `${this._value}${this._unit}`;
    }
  }

  export namespace Fixed {
    export interface JSON<
      T extends Type = Type,
      U extends ToDimension<T> = ToDimension<T>
    > extends Numeric.Fixed.JSON<T> {
      unit: U;
    }
  }

  interface IDimension<T extends Type = Type, CALC extends boolean = boolean>
    extends Value<T, CALC> {
    hasCalculation(): this is Calculated<T>;
    resolve(resolver?: unknown): Fixed<T, ToCanonical<T>>;
  }

  export function isCalculated(value: unknown): value is Calculated {
    return value instanceof Calculated;
  }

  export function isFixed(value: unknown): value is Fixed {
    return value instanceof Fixed;
  }

  export function isDimension(value: unknown): value is Numeric {
    return value instanceof Calculated || value instanceof Fixed;
  }

  // /**
  //  * Helper type to remove the "-percentage" bit
  //  */
  // type ToFixed<T extends Type> = T extends `${infer U}-percentage` ? U : T;

  /**
   * Helper type to infer Unit sub-type based on its string representation.
   */
  type ToDimension<T extends Type> = T extends "angle"
    ? Unit.Angle
    : T extends "angle-percentage"
    ? Unit.Angle
    : T extends "length"
    ? Unit.Length
    : T extends "length-percentage"
    ? Unit.Length
    : // We currently do not really support other dimensions
      never;

  /**
   * Helper type to infer the canonical unit of a sub-type based on its string
   * representation.
   */
  type ToCanonical<T extends Type> = T extends "angle"
    ? "deg"
    : T extends "angle-percentage"
    ? "deg"
    : T extends "length"
    ? "px"
    : T extends "length-percentage"
    ? "px"
    : // We currently do not really support other dimensions
      never;
}

type Type = BaseNumeric.Dimension | `${BaseNumeric.Dimension}-percentage`;
