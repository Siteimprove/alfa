import { Comparable, Comparison } from "@siteimprove/alfa-comparable";
import { Hash } from "@siteimprove/alfa-hash";

import {
  Dimension as BaseDimension,
  Numeric as BaseNumeric,
} from "../../calculation/numeric/index.js";
import { Convertible, Unit } from "../../unit/index.js";

import type { PartiallyResolvable, Resolvable } from "../resolvable.js";

import { Numeric } from "./numeric.js";

/**
 * @public
 */
export namespace Dimension {
  /**
   * Dimensions that are the result of a calculation.
   */
  export abstract class Calculated<T extends Type = Type, PR extends Type = T>
    extends Numeric.Calculated<T, ToBase[T], PR>
    implements
      Resolvable<Fixed<ToBase[T], ToCanonicalUnit[ToBase[T]]>, unknown>,
      PartiallyResolvable<any, any>
  {
    protected constructor(math: Numeric.ToMath<T>, type: T) {
      super(math, type);
    }

    public hasCalculation(): this is Calculated<T, PR> {
      return true;
    }

    public abstract resolve(
      resolver?: unknown,
    ): Fixed<ToBase[T], ToCanonicalUnit[ToBase[T]]>;

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
      T extends BaseNumeric.Dimension = BaseNumeric.Dimension,
      // The actual unit in which the dimension is expressed, e.g px, em, rad, …
      U extends BaseDimension.ToUnit[T] = BaseDimension.ToUnit[T],
    >
    extends Numeric.Fixed<T>
    implements
      Resolvable<Fixed<T, ToCanonicalUnit[T]>, unknown>,
      Convertible<BaseDimension.ToUnit[T]>,
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

    public hasCalculation(): this is never {
      return false;
    }

    /**
     * {@link https://drafts.csswg.org/css-values/#canonical-unit}
     */
    public get canonicalUnit(): ToCanonicalUnit[T] {
      // The this.type test does not correctly narrow T, so we need to force typing.
      return (
        this.type === "angle" ? Unit.Angle.Canonical : Unit.Length.Canonical
      ) as ToCanonicalUnit[T];
    }

    public abstract hasUnit<V extends BaseDimension.ToUnit[T]>(
      unit: V,
    ): this is Fixed<T, V>;

    public abstract withUnit<V extends BaseDimension.ToUnit[T]>(
      unit: V,
    ): Fixed<T, V>;

    public abstract resolve(resolver?: unknown): Fixed<T, ToCanonicalUnit[T]>;

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
      T extends BaseNumeric.Dimension = BaseNumeric.Dimension,
      U extends BaseDimension.ToUnit[T] = BaseDimension.ToUnit[T],
    > extends Numeric.Fixed.JSON<T> {
      unit: U;
    }
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

type Type = BaseNumeric.Dimension | `${BaseNumeric.Dimension}-percentage`;

/**
 * Helper types to turn a dimension or dimension-percentage type into its
 * components:
 */
type ToBase = {
  angle: "angle";
  "angle-percentage": "angle";
  length: "length";
  "length-percentage": "length";
};
type ToCanonicalUnit = {
  angle: Unit.Angle.Canonical;
  length: Unit.Length.Canonical;
};
