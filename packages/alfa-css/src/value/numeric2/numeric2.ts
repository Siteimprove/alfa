import { Comparable, Comparison } from "@siteimprove/alfa-comparable";
import { Hash } from "@siteimprove/alfa-hash";
import { Real } from "@siteimprove/alfa-math";

import * as json from "@siteimprove/alfa-json";

import { Value } from "../../value";

/**
 * @public
 */
export abstract class Numeric2<T extends Numeric2.Type = Numeric2.Type>
  extends Value<T>
  implements Comparable<Numeric2<T>>
{
  /**
   * The number of decimals stored for every numeric value.
   */
  public static readonly Decimals = 7;

  protected readonly _value: number;
  protected readonly _type: T;

  protected constructor(value: number, type: T) {
    super();
    this._value = Real.round(value, Numeric2.Decimals);
    this._type = type;
  }

  public get value(): number {
    return this._value;
  }

  public get type(): T {
    return this._type;
  }

  public abstract scale(factor: number): Numeric2<T>;

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
      value: this._value,
      type: this._type,
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
    type: T;
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
