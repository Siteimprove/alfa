import { Comparable, Comparison } from "@siteimprove/alfa-comparable";

import {
  Dimension as BaseDimension,
  Numeric as BaseNumeric,
} from "../../calculation/numeric";
import { Convertible } from "../../unit";
import { Value } from "../../value";

import { Numeric } from "./numeric";
import { Hash } from "@siteimprove/alfa-hash";

/**
 * @public
 */
export type Dimension<T extends BaseNumeric.Dimension = BaseNumeric.Dimension> =
  Dimension.Calculated<T> | Dimension.Fixed<T>;

/**
 * @public
 */
export namespace Dimension {
  /**
   * Dimensions that are the result of a calculation.
   */
  export abstract class Calculated<
      T extends BaseNumeric.Dimension = BaseNumeric.Dimension
    >
    extends Numeric.Calculated<T>
    implements IDimension<T, true>
  {
    protected constructor(math: Numeric.ToMath<T>, type: T) {
      super(math, type);
    }

    public hasCalculation(): this is Calculated<T> {
      return true;
    }

    public abstract resolve(
      resolver?: unknown
    ): Fixed<T, BaseDimension.ToCanonical<T>>;

    public equals(value: unknown): value is this {
      return value instanceof Calculated && super.equals(value);
    }
  }

  /**
   * @public
   */
  export namespace Calculated {
    export interface JSON<
      T extends BaseNumeric.Dimension = BaseNumeric.Dimension
    > extends Numeric.Calculated.JSON<T> {}
  }

  /**
   * Dimensions that are a fixed (not calculated) value.
   */
  export abstract class Fixed<
      T extends BaseNumeric.Dimension = BaseNumeric.Dimension,
      // The actual unit in which the dimension is expressed, e.g px, em, rad, …
      U extends BaseDimension.ToDimension<T> = BaseDimension.ToDimension<T>
    >
    extends Numeric.Fixed<T>
    implements
      IDimension<T, false>,
      Convertible<BaseDimension.ToDimension<T>>,
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
    public get canonicalUnit(): BaseDimension.ToCanonical<T> {
      // The this.type test does not correctly narrow T, so we need to force typing.
      return (
        this.type === "angle" ? "deg" : "px"
      ) as BaseDimension.ToCanonical<T>;
    }

    public hasUnit<V extends BaseDimension.ToDimension<T>>(
      unit: V
    ): this is Fixed<T, V> {
      return (this._unit as BaseDimension.ToDimension<T>) === unit;
    }

    public abstract withUnit<V extends BaseDimension.ToDimension<T>>(
      unit: V
    ): Fixed<T, V>;

    public abstract resolve(
      resolver?: unknown
    ): Fixed<T, BaseDimension.ToCanonical<T>>;

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

  /**
   * @public
   */
  export namespace Fixed {
    export interface JSON<
      T extends BaseNumeric.Dimension = BaseNumeric.Dimension,
      U extends BaseDimension.ToDimension<T> = BaseDimension.ToDimension<T>
    > extends Numeric.Fixed.JSON<T> {
      unit: U;
    }
  }

  interface IDimension<
    T extends BaseNumeric.Dimension = BaseNumeric.Dimension,
    CALC extends boolean = boolean
  > extends Value<T, CALC> {
    hasCalculation(): this is Calculated<T>;
    resolve(resolver?: unknown): Fixed<T, BaseDimension.ToCanonical<T>>;
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
}
