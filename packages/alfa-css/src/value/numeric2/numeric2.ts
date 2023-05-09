import { Comparable, Comparison } from "@siteimprove/alfa-comparable";
import { Hash } from "@siteimprove/alfa-hash";
import { Real } from "@siteimprove/alfa-math";

import * as json from "@siteimprove/alfa-json";

import { Value } from "../../value";

/**
 * @public
 */
export abstract class Numeric2<T extends Numeric2.Type = Numeric2.Type>
  extends Value<T, false>
  implements Comparable<Numeric2<T>>
{
  /**
   * The number of decimals stored for every numeric value.
   */
  public static readonly Decimals = 7;

  protected readonly _value: number;

  protected constructor(value: number, type: T) {
    super(type, false);
    this._value = Real.round(value, Numeric2.Decimals);
  }

  public get value(): number {
    return this._value;
  }

  public abstract scale(factor: number): Numeric2<T>;

  public resolve<N extends Numeric2<T>>(this: N): N {
    return this;
  }

  public equals(value: unknown): value is this {
    return value instanceof Numeric2 && value._value === this._value;
  }

  public compare(value: Numeric2<T>): Comparison {
    return Comparable.compareNumber(this._value, value._value);
  }

  public hash(hash: Hash): void {
    hash.writeFloat64(this._value);
  }

  public toJSON(): Numeric2.JSON<T> {
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
export namespace Numeric2 {
  export interface JSON<T extends Type = Type> extends Value.JSON<T> {
    [key: string]: json.JSON;
    value: number;
  }

  export function isNumeric(value: unknown): value is Numeric2 {
    return value instanceof Numeric2;
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
