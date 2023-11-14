import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { Real } from "@siteimprove/alfa-math";

import * as json from "@siteimprove/alfa-json";

/**
 * @public
 */
export abstract class Numeric<T extends Numeric.Type = Numeric.Type>
  implements Equatable, Hashable, Serializable
{
  /**
   * The number of decimals stored for every numeric value.
   */
  public static readonly Decimals = 7;

  protected readonly _value: number;
  protected readonly _type: T;

  protected constructor(value: number, type: T) {
    this._type = type;
    this._value = Real.round(value, Numeric.Decimals);
  }

  public get type(): T {
    return this._type;
  }

  public get value(): number {
    return this._value;
  }

  public abstract scale(factor: number): Numeric<T>;

  public equals(value: unknown): value is this {
    return value instanceof Numeric && value._value === this._value;
  }

  public hash(hash: Hash): void {
    hash.writeFloat64(this._value);
  }

  public toJSON(): Numeric.JSON<T> {
    return {
      type: this._type,
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
export namespace Numeric {
  export interface JSON<T extends Type = Type> {
    [key: string]: json.JSON;
    type: T;
    value: number;
  }

  /** @public (knip) */
  export function isNumeric(value: unknown): value is Numeric {
    return value instanceof Numeric;
  }

  /**
   * {@link https://drafts.csswg.org/css-values-4/#numeric-types}
   */
  export type Scalar = "integer" | "number";

  /**
   * {@link https://drafts.csswg.org/css-values-4/#numeric-types}
   */
  export type Ratio = "percentage";

  /**
   * {@link https://drafts.csswg.org/css-values-4/#lengths}
   * {@link https://drafts.csswg.org/css-values-4/#other-units}
   */
  export type Dimension = "angle" | "length";
  // unsupported dimensions
  // | "duration"
  // | "frequency"
  // | "resolution";

  /**
   * @internal
   */
  export type Type = Scalar | Ratio | Dimension;
}
