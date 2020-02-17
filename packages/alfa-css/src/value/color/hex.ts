import { Parser } from "@siteimprove/alfa-parser";

import * as json from "@siteimprove/alfa-json";

import { Token } from "../../syntax/token";
import { Number } from "../number";
import { Color } from "../color";

const { map } = Parser;

export class Hex implements Color {
  public static of(value: number): Hex {
    return new Hex(value);
  }

  private readonly _value: number;

  private constructor(value: number) {
    // Make sure that only the lower 4 bytes are stored.
    this._value = value & 0xff_ff_ff_ff;
  }

  public get type(): "color" {
    return "color";
  }

  public get format(): "hex" {
    return "hex";
  }

  public get value(): number {
    return this._value;
  }

  public get red(): Number {
    return Number.of(this._value >>> 24);
  }

  public get green(): Number {
    return Number.of((this._value >>> 16) & 0xff);
  }

  public get blue(): Number {
    return Number.of((this._value >>> 8) & 0xff);
  }

  public get alpha(): Number {
    return Number.of(this._value & 0xff);
  }

  public equals(value: unknown): value is this {
    return value instanceof Hex && value._value === this._value;
  }

  public toJSON(): Hex.JSON {
    return {
      type: "color",
      format: "hex",
      value: this._value
    };
  }

  public toString(): string {
    return `#${this._value.toString(16).padStart(8, "0")}`;
  }
}

export namespace Hex {
  export interface JSON {
    [key: string]: json.JSON;
    type: "color";
    format: "hex";
    value: number;
  }

  export function isHex(value: unknown): value is Hex {
    return value instanceof Hex;
  }

  /**
   * @see https://drafts.csswg.org/css-color/#typedef-hex-color
   */
  export const parse = map(
    map(
      Token.parseHash(hash => {
        switch (hash.value.length) {
          case 3:
          case 4:
          case 6:
          case 8: {
            return /^[\da-f]*$/i.test(hash.value);
          }

          default:
            return false;
        }
      }),
      hash => {
        switch (hash.value.length) {
          case 3: {
            const [r, g, b] = hash.value;
            return r + r + g + g + b + b + "ff";
          }

          case 4: {
            const [r, g, b, a] = hash.value;
            return r + r + g + g + b + b + a + a;
          }

          case 6:
            return hash.value + "ff";

          default:
            return hash.value;
        }
      }
    ),
    hash => Hex.of(parseInt(hash, 16))
  );
}
