import { Array } from "@siteimprove/alfa-array";
import { Equatable } from "@siteimprove/alfa-equatable";

import * as json from "@siteimprove/alfa-json";

/**
 * Individual flags are numbers with at most one bit set to 1, i.e. powers of
 * two.
 * Since we do not currently need more than 8 flags, we can safely restrict this
 * union.
 *
 * @internal
 */
type allFlags = 0 | 1 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256;

/**
 * Class for modelling set of boolean flags.
 * Flags are stored as bits in a single number. Due to Javascript limitation
 * on bitwise operations, this means that a maximum of 32 flags can be handled.
 * We currently limit the class at a maximum of 8 flags since it fits our needs.
 *
 * @public
 */
export class Flags<F extends allFlags = allFlags>
  implements Equatable, json.Serializable<Flags.JSON>
{
  /**
   * Empty set of flags.
   */
  public static empty = new Flags(0);

  protected _value: number;

  protected constructor(value: number) {
    this._value = value;
  }

  /**
   * A compact representation of the set of flags as a number
   */
  public get value(): number {
    return this._value;
  }

  /**
   * Test whether a given flag is present (or set) in the set of flags
   */
  public has(flag: F): boolean {
    return (this._value & flag) === flag;
  }

  /**
   * Test whether a given flag is present (or set) in the set of flags
   */
  public isSet = this.has;

  /**
   * Adds a list of flags to the set, and return a new one.
   */
  public add(...flags: Array<F>): this {
    return new (<typeof Flags>this.constructor)(
      this._value | Flags._reduce(...flags)
    ) as this;
  }

  /**
   * Adds a list of flags to the set (aka sets the flags), and return a new one.
   */
  public set = this.add;

  /**
   * Removes a list of flags from the set, and return a new one.
   */
  public remove(...flags: Array<F>): this {
    return new (<typeof Flags>this.constructor)(
      this._value & ~Flags._reduce(...flags)
    ) as this;
  }

  /**
   * Removes a list of flags to the set (aka unsets the flags), and return a new one.
   */
  public unset = this.remove;

  /**
   * Reduces a list of flags into a single number representing all of them
   * (with only the corresponding bits set to 1).
   */
  protected static _reduce(...flags: Array<number>): number {
    return Array.reduce(flags, (prev: number, cur) => prev | cur, 0);
  }

  public equals(value: Flags): boolean;
  public equals(value: unknown): value is this;
  public equals(value: unknown): boolean {
    return value instanceof Flags && this._value === value._value;
  }

  public toJSON(): Flags.JSON {
    return {};
  }
}

export namespace Flags {
  export interface JSON {
    [key: string]: boolean;
  }
}
