import { Comparable, Comparison } from "@siteimprove/alfa-comparable";
import { Hash } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { Real } from "@siteimprove/alfa-math";

import { Math } from "../../calculation/index.js";
import { Numeric as BaseNumeric } from "../../calculation/numeric/index.js";

import type { Resolvable } from "../resolvable.js";
import { Value } from "../value.js";
import type { Length } from "./length.js";

/**
 * @public
 */
export type Numeric<T extends Numeric.Type = Numeric.Type> =
  | Numeric.Calculated<T>
  | Numeric.Fixed<T>;

/**
 * @public
 */
export namespace Numeric {
  // Math expressions make no distinction between integer and float (number).
  /**
   * @internal
   */
  export type ToMath<T extends Type> = Math<
    T extends BaseNumeric.Scalar ? "number" : T
  >;

  /**
   * Numerics that are the result of a calculation.
   */
  export abstract class Calculated<
      T extends Type = Type,
      R extends Type = T,
      PR extends Type = R,
    >
    extends Value<T, true, R, PR>
    implements Resolvable<Fixed<R>, never>
  {
    protected readonly _math: ToMath<T>;

    protected constructor(math: ToMath<T>, type: T) {
      super(type, true);
      this._math = math;
    }

    public get math(): ToMath<T> {
      return this._math;
    }

    public hasCalculation(): this is Calculated<T, R, PR> {
      return true;
    }

    public abstract resolve(resolver?: GenericResolver): Fixed<R>;

    public equals(value: unknown): value is this {
      return value instanceof Calculated && value._math.equals(this._math);
    }

    public hash(hash: Hash) {
      this._math.hash(hash);
    }

    public toJSON(): Calculated.JSON<T> {
      return { ...super.toJSON(), math: this._math.toJSON() };
    }

    public toString(): string {
      return this._math.toString();
    }
  }

  /**
   * @public
   */
  export namespace Calculated {
    export interface JSON<T extends Type = Type> extends Value.JSON<T> {
      math: Serializable.ToJSON<ToMath<T>>;
    }
  }

  /**
   * Numerics that are a fixed (not calculated) value.
   */
  export abstract class Fixed<
      T extends Type = Type,
      R extends Type = T,
      PR extends Type = R,
    >
    extends Value<T, false, R, PR>
    implements Resolvable<Fixed<R>, never>, Comparable<Fixed>
  {
    protected readonly _value: number;

    protected constructor(value: number, type: T) {
      super(type, false);
      this._value = Real.round(value, BaseNumeric.Decimals);
    }

    public get value(): number {
      return this._value;
    }

    public abstract scale(factor: number): Fixed<T, R>;

    public hasCalculation(): this is never {
      return false;
    }

    public abstract resolve(resolver?: unknown): Fixed<R>;

    public isZero(): boolean {
      return this._value === 0;
    }

    /**
     * @internal
     */
    public abstract toBase(): T extends Exclude<Type, `${string}-percentage`>
      ? BaseNumeric<T>
      : never;

    public equals(value: unknown): value is this {
      return value instanceof Fixed && value._value === this._value;
    }

    public compare(value: Fixed<T>): Comparison {
      return Comparable.compareNumber(this._value, value._value);
    }

    public hash(hash: Hash): void {
      hash.writeFloat64(this._value);
    }

    public toJSON(): Fixed.JSON<T> {
      return {
        ...super.toJSON(),
        value: this._value,
      };
    }

    public toString(): string {
      return `${this._value}`;
    }
  }

  /**
   * @public
   */
  export namespace Fixed {
    export interface JSON<T extends Type = Type> extends Value.JSON<T> {
      value: number;
    }
  }

  export type Type = BaseNumeric.Type | `${BaseNumeric.Dimension}-percentage`;

  /**
   * A length resolver may be needed even for non-length calculation due to
   * division cancelling units.
   *
   * @internal
   */
  export type GenericResolver = Partial<Length.Resolver>;

  export function isCalculated(value: unknown): value is Calculated {
    return value instanceof Calculated;
  }

  export function isFixed(value: unknown): value is Fixed {
    return value instanceof Fixed;
  }

  export function isNumeric(value: unknown): value is Numeric {
    return value instanceof Calculated || value instanceof Fixed;
  }

  // Curryfied version is more convenient for monadic call sites.
  export function isZero(value: Fixed): boolean {
    return value.isZero();
  }
}
