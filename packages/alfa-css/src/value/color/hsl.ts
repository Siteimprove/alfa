import type { Hash } from "@siteimprove/alfa-hash";
import { Real } from "@siteimprove/alfa-math";
import { Parser } from "@siteimprove/alfa-parser";

import { Function, type Parser as CSSParser } from "../../syntax/index.js";

import { Angle, Number, Percentage } from "../numeric/index.js";

import { hslToRgb } from "./converters.js";
import { Format } from "./format.js";
import { RGB } from "./rgb.js";
import { Triplet } from "./triplet.js";

const { map, either } = Parser;

// We cannot easily use Resolvable.Resolved because Percentage may resolve to
// anything depending on the base, here we want to keep them as percentages.
type ToCanonical<T extends Angle | Number | Percentage<"percentage">> =
  T extends Angle
    ? Angle.Canonical
    : T extends Number
      ? Number.Canonical
      : T extends Percentage
        ? Percentage.Canonical
        : Angle.Canonical | Number.Canonical | Percentage.Canonical;

/**
 * {@link https://drafts.csswg.org/css-color/#the-hsl-notation}
 *
 * @public
 */
export class HSL<
  H extends Number.Fixed | Angle.Fixed = Number.Fixed | Angle.Fixed,
  A extends Number.Fixed | Percentage.Fixed<"percentage"> =
    | Number.Fixed
    | Percentage.Fixed<"percentage">,
> extends Triplet<"hsl", A> {
  public static of<
    H extends Number.Canonical | Angle.Canonical,
    A extends Number.Canonical | Percentage.Canonical,
    S extends Percentage<"percentage">,
    L extends Percentage<"percentage">,
  >(hue: H, saturation: S, lightness: L, alpha: A): HSL<H, A>;

  public static of<
    H extends Number | Angle,
    A extends Number | Percentage<"percentage">,
    S extends Percentage<"percentage">,
    L extends Percentage<"percentage">,
  >(
    hue: H,
    saturation: S,
    lightness: L,
    alpha: A,
  ): HSL<ToCanonical<H>, ToCanonical<A>>;

  public static of<
    H extends Number | Angle,
    A extends Number | Percentage<"percentage">,
    S extends Percentage<"percentage">,
    L extends Percentage<"percentage">,
  >(
    hue: H,
    saturation: S,
    lightness: L,
    alpha: A,
  ): HSL<ToCanonical<H>, ToCanonical<A>> {
    return new HSL(
      hue.resolve() as ToCanonical<H>,
      saturation.resolve(),
      lightness.resolve(),
      alpha.resolve() as ToCanonical<A>,
    );
  }

  private readonly _hue: H;
  private readonly _saturation: Percentage.Canonical;
  private readonly _lightness: Percentage.Canonical;
  private readonly _red: Percentage.Canonical;
  private readonly _green: Percentage.Canonical;
  private readonly _blue: Percentage.Canonical;

  protected constructor(
    hue: H,
    saturation: Percentage.Canonical,
    lightness: Percentage.Canonical,
    alpha: A,
  ) {
    super("hsl", alpha);
    this._hue = hue;
    this._saturation = saturation;
    this._lightness = lightness;

    const degrees = Angle.isAngle(hue) ? hue.withUnit("deg").value : hue.value;

    const [red, green, blue] = hslToRgb(
      Real.modulo(degrees, 360),
      Real.clamp(saturation.value, 0, 1),
      Real.clamp(lightness.value, 0, 1),
    );

    this._red = Percentage.of<"percentage">(red);
    this._green = Percentage.of<"percentage">(green);
    this._blue = Percentage.of<"percentage">(blue);
  }

  public get hue(): H {
    return this._hue;
  }

  public get saturation(): Percentage.Canonical {
    return this._saturation;
  }

  public get lightness(): Percentage.Canonical {
    return this._lightness;
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
      value instanceof HSL &&
      value._hue.equals(this._hue) &&
      value._saturation.equals(this._saturation) &&
      value._lightness.equals(this._lightness) &&
      value._alpha.equals(this._alpha)
    );
  }

  public hash(hash: Hash): void {
    hash
      .writeHashable(this._hue)
      .writeHashable(this._saturation)
      .writeHashable(this._lightness)
      .writeHashable(this._alpha);
  }

  public toJSON(): HSL.JSON {
    return {
      ...super.toJSON(),
      hue: this._hue.toJSON(),
      saturation: this._saturation.toJSON(),
      lightness: this._lightness.toJSON(),
    };
  }

  public toString(): string {
    return `hsl(${this._hue} ${this._saturation} ${this._lightness}${
      this._alpha.value === 1 ? "" : ` / ${this._alpha}`
    })`;
  }
}

/**
 * @public
 */
export namespace HSL {
  export interface JSON extends Triplet.JSON<"hsl"> {
    hue: Number.Fixed.JSON | Angle.Fixed.JSON;
    saturation: Percentage.Fixed.JSON;
    lightness: Percentage.Fixed.JSON;
  }

  export function isHSL<
    H extends Number.Fixed | Angle.Fixed,
    A extends Number.Fixed | Percentage.Fixed,
  >(value: unknown): value is HSL<H, A> {
    return value instanceof HSL;
  }

  /**
   * {@link https://drafts.csswg.org/css-color/#typedef-hue}
   */
  const parseHue = either(Number.parse, Angle.parse);

  /**
   * {@link https://drafts.csswg.org/css-color/#funcdef-hsl}
   */
  export const parse: CSSParser<HSL> = map(
    Function.parse(
      ["hsl", "hsla"],
      either(
        // Legacy syntax
        Triplet.parseTriplet([parseHue, Percentage.parse<"percentage">], true),
        // Modern syntax
        Triplet.parseTriplet([parseHue, Percentage.parse<"percentage">]),
      ),
    ),
    ([, [hue, saturation, lightness, alpha]]) =>
      HSL.of(hue, saturation, lightness, alpha),
  );
}
