import { Comparable, Comparison } from "@siteimprove/alfa-comparable";
import { Hash } from "@siteimprove/alfa-hash";
import { Real } from "@siteimprove/alfa-math";

import { Math } from "../../calculation";
import { Numeric as NumericBase } from "../../calculation/numeric/index-new";

import { Value } from "../../value";
import { Serializable } from "@siteimprove/alfa-json";

export type Numeric<T extends Numeric.Type = Numeric.Type> =
  | Numeric.Calculated<T>
  | Numeric.Fixed<T>;

export namespace Numeric {
  // Math expressions make no distinction between integer and float (number).
  type ToMath<T extends Type> = Math<
    T extends NumericBase.Scalar ? "number" : T
  >;

  /**
   * Numeric that may contain calculations.
   *
   * @remarks
   * We actually guarantee that these **do** contain a calculation.
   *
   * @public
   */
  export abstract class Calculated<T extends Type = Type>
    extends Value<T, true>
    implements INumeric<T, true>
  {
    protected readonly _math: ToMath<T>;

    protected constructor(math: ToMath<T>, type: T) {
      super(type, true);
      this._math = math;
    }

    public get math(): ToMath<T> {
      return this._math;
    }

    public hasCalculation(): this is Calculated<T> {
      return true;
    }

    public abstract resolve(resolver?: unknown): Fixed<T>;

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
   * Lengths that are guaranteed to not contain any calculation.
   *
   * @public
   */
  export abstract class Fixed<T extends Type = Type>
    extends Value<T, false>
    implements INumeric<T, false>, Comparable<Fixed>
  {
    protected readonly _value: number;

    protected constructor(value: number, type: T) {
      super(type, false);
      this._value = Real.round(value, NumericBase.Decimals);
    }

    public get value(): number {
      return this._value;
    }

    public abstract scale(factor: number): Fixed<T>;

    public hasCalculation(): this is Calculated<T> {
      return false;
    }

    public resolve(): this {
      return this;
    }

    public isZero(): boolean {
      return this._value === 0;
    }

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

  export type Type = NumericBase.Type | `${NumericBase.Dimension}-percentage`;

  /**
   * @remarks
   * While hasCalculated and resolve are already defined on Value, they have
   * a stricter type for Numeric. Hence, having an interface is more convenient
   * to record that type.
   */
  interface INumeric<T extends Type = Type, CALC extends boolean = boolean>
    extends Value<T, CALC> {
    hasCalculation(): this is Calculated<T>;
    resolve(): Fixed<T>;
  }

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
