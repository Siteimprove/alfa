import type { Hash } from "@siteimprove/alfa-hash";
import { Real } from "@siteimprove/alfa-math";
import { Parser } from "@siteimprove/alfa-parser";

import { Function, type Parser as CSSParser } from "../../syntax/index.js";

import { Angle, Number, Percentage } from "../numeric/index.js";

import { CIE } from "./converters.js";
import { Format } from "./format.js";
import { RGB } from "./rgb.js";
import { Triplet } from "./triplet.js";

const { map, either } = Parser;

/**
 * {@link https://drafts.csswg.org/css-color/#specifying-oklab-oklch}
 *
 * @public
 */
export class OkLCH extends Triplet<"oklch"> {
  public static of(
    lightness: Number | Percentage<"number">,
    chroma: Number | Percentage<"number">,
    hue: Number | Angle,
    alpha: Number | Percentage<"percentage">,
  ): OkLCH {
    const l = lightness.resolve();
    const c = chroma.resolve({ percentageBase: Number.of(0.4) });

    return new OkLCH(
      Number.of(
        // Lightness clamping happens at parse time, we can't do it until we've
        // resolved calculations.
        Real.clamp(l.value, 0, 1),
      ),
      Number.of(
        Real.clamp(Number.isNumber(c) ? c.value : c.value * 0.4, 0, +Infinity),
      ),
      hue.resolve(),
      alpha.resolve(),
    );
  }

  private readonly _lightness: OkLCH.Component;
  private readonly _chroma: OkLCH.Component;
  private readonly _hue: OkLCH.Hue;
  private readonly _red: Percentage.Canonical;
  private readonly _green: Percentage.Canonical;
  private readonly _blue: Percentage.Canonical;

  protected constructor(
    lightness: OkLCH.Component,
    chroma: OkLCH.Component,
    hue: OkLCH.Hue,
    alpha: Triplet.Alpha,
  ) {
    super("oklch", alpha);
    this._lightness = lightness;
    this._chroma = chroma;
    this._hue = hue;

    const degrees = Angle.isAngle(hue) ? hue.withUnit("deg").value : hue.value;

    const [red, green, blue] = CIE.oklchToRgb([
      lightness.value,
      chroma.value,
      degrees,
    ]);

    this._red = Percentage.of<"percentage">(red);
    this._green = Percentage.of<"percentage">(green);
    this._blue = Percentage.of<"percentage">(blue);
  }

  public get lightness(): OkLCH.Component {
    return this._lightness;
  }

  public get chroma(): OkLCH.Component {
    return this._chroma;
  }

  public get hue(): OkLCH.Hue {
    return this._hue;
  }

  public get red(): Percentage.Canonical {
    return this._red;
  }

  public get green(): Percentage.Canonical {
    return this._green;
  }

  public get blue(): Percentage.Canonical {
    return this._blue;
  }

  public resolve(): RGB.Canonical {
    return RGB.of(
      ...Format.resolve(this.red, this.green, this.blue, this.alpha),
    );
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof OkLCH &&
      value._lightness.equals(this._lightness) &&
      value._chroma.equals(this._chroma) &&
      value._hue.equals(this._hue) &&
      value._alpha.equals(this._alpha)
    );
  }

  public hash(hash: Hash): void {
    hash
      .writeHashable(this._lightness)
      .writeHashable(this._chroma)
      .writeHashable(this._hue)
      .writeHashable(this._alpha);
  }

  public toJSON(): OkLCH.JSON {
    return {
      ...super.toJSON(),
      lightness: this._lightness.toJSON(),
      chroma: this._chroma.toJSON(),
      hue: this._hue.toJSON(),
    };
  }

  public toString(): string {
    return `oklch(${this._lightness} ${this._chroma} ${this._hue} ${
      this._alpha.value === 1 ? "" : ` / ${this._alpha}`
    })`;
  }
}

/**
 * @public
 */
export namespace OkLCH {
  export interface JSON extends Triplet.JSON<"oklch"> {
    lightness: Number.Fixed.JSON;
    chroma: Number.Fixed.JSON;
    hue: Number.Fixed.JSON | Angle.Fixed.JSON;
  }

  /** @internal */
  export type Hue = Number.Canonical | Angle.Canonical;
  /**
   * Since the percentages are not 1-based, we rather use numbers to avoid
   * miss-scaling when we use the values.
   *
   * @internal
   */
  export type Component = Number.Canonical;

  export function isOkLCH(value: unknown): value is OkLCH {
    return value instanceof OkLCH;
  }

  /**
   * {@link https://drafts.csswg.org/css-color/#typedef-hue}
   */
  const parseHue = either(Number.parse, Angle.parse);

  /**
   * {@link https://drafts.csswg.org/css-color/#funcdef-hsl}
   */
  export const parse: CSSParser<OkLCH> = map(
    Function.parse(
      "oklch",
      Triplet.parseTriplet([
        either(Percentage.parse<"percentage">, Number.parse),
        either(Percentage.parse<"percentage">, Number.parse),
        parseHue,
      ]),
    ),
    ([, [lightness, chroma, hue, alpha]]) =>
      OkLCH.of(lightness, chroma, hue, alpha),
  );
}
