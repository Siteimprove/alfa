import { Array } from "@siteimprove/alfa-array";
import { Equatable } from "@siteimprove/alfa-equatable";

import * as json from "@siteimprove/alfa-json";

export class Flags<F extends number = number>
  implements Equatable, json.Serializable<Flags.JSON>
{
  protected _value: number;

  protected constructor(value: number) {
    this._value = value;
  }

  public get value(): number {
    return this._value;
  }

  public has(flag: F): boolean {
    return (this._value & flag) === flag;
  }

  public isSet = this.has;

  public add(...flags: Array<F>): this {
    return new (<typeof Flags>this.constructor)(
      this._value | Flags._reduce(...flags)
    ) as this;
  }

  public set = this.add;

  public remove(...flags: Array<F>): this {
    return new (<typeof Flags>this.constructor)(
      this._value & ~Flags._reduce(...flags)
    ) as this;
  }

  public unset = this.remove;

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
