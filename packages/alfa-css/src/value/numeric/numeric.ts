import { Comparable, Comparison } from "@siteimprove/alfa-comparable";
import { Hash } from "@siteimprove/alfa-hash";
import { Real } from "@siteimprove/alfa-math";

import * as json from "@siteimprove/alfa-json";

import { Value } from "../../value";

/**
 * @public
 */
export abstract class Numeric<T extends string = string>
  extends Value<T>
  implements Comparable<Numeric<T>>
{
  /**
   * The number of decimals stored for every numeric value.
   */
  public static readonly Decimals = 7;

  protected readonly _value: number;

  protected constructor(value: number) {
    super();
    this._value = Real.round(value, Numeric.Decimals);
  }

  public get value(): number {
    return this._value;
  }

  public equals(value: unknown): value is this {
    return value instanceof Numeric && value._value === this._value;
  }

  public compare(value: Numeric<T>): Comparison {
    return Comparable.compareNumber(this._value, value._value);
  }

  public hash(hash: Hash): void {
    hash.writeFloat64(this._value);
  }

  public abstract toJSON(): Numeric.JSON<T>;

  public toString(): string {
    return `${this._value}`;
  }
}

/**
 * @public
 */
export namespace Numeric {
  export interface JSON<T extends string = string> extends Value.JSON<T> {
    [key: string]: json.JSON;
    value: number;
  }

  export function isNumeric(value: unknown): value is Numeric {
    return value instanceof Numeric;
  }
}
