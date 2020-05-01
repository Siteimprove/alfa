import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { round } from "@siteimprove/alfa-math";

import * as json from "@siteimprove/alfa-json";

export abstract class Numeric implements Equatable, Hashable, Serializable {
  /**
   * The number of decimals stored for every numeric value.
   */
  public static readonly Decimals = 7;

  protected readonly _value: number;

  protected constructor(value: number) {
    this._value = round(value, Numeric.Decimals);
  }

  public get value(): number {
    return this._value;
  }

  public equals(value: unknown): value is this {
    return value instanceof Numeric && value._value === this._value;
  }

  public hash(hash: Hash): void {
    Hash.writeFloat64(hash, this._value);
  }

  public abstract toJSON(): Numeric.JSON;

  public toString(): string {
    return `${this._value}`;
  }
}

export namespace Numeric {
  export interface JSON {
    [key: string]: json.JSON;
    type: string;
    value: number;
  }

  export function isNumeric(value: unknown): value is Numeric {
    return value instanceof Numeric;
  }
}
