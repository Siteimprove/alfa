import type { Hash } from "@siteimprove/alfa-hash";
import { Real } from "@siteimprove/alfa-math";
import { Parser } from "@siteimprove/alfa-parser";

import {
  Function,
  type Parser as CSSParser,
  Token,
} from "../../syntax/index.js";
import { Keyword } from "../textual/keyword.js";

import { Angle, Number, Percentage } from "../numeric/index.js";

import { Format } from "./format.js";
import { RGB } from "./rgb.js";
import { Triplet } from "./triplet.js";

const { pair, map, either, option, right, take, delimited } = Parser;

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
      Real.modulo(degrees, 360) / 60,
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
   * {@link https://drafts.csswg.org/css-color/#typedef-alpha-value}
   */
  const parseAlpha = either(Number.parse, Percentage.parse<"percentage">);

  /**
   * {@link https://drafts.csswg.org/css-color/#typedef-hue}
   */
  const parseHue = either(Number.parse, Angle.parse);

  const orNone = <T>(parser: CSSParser<T>) =>
    either(
      parser,
      map(Keyword.parse("none"), () => Percentage.of<"percentage">(0)),
    );

  const parseTriplet = (separator: CSSParser<any>, legacy: boolean = false) =>
    map(
      pair(
        legacy
          ? parseHue
          : either(
              parseHue,
              map(Keyword.parse("none"), () => Number.of(0)),
            ),
        take(
          right(
            separator,
            legacy
              ? Percentage.parse<"percentage">
              : orNone(Percentage.parse<"percentage">),
          ),
          2,
        ),
      ),
      ([h, [s, l]]) => [h, s, l] as const,
    );

  /**
   * @remarks
   * Modern syntax is supposed to accept numbers in addition to percentages
   * for saturation and lightness. This seems to have poor browser support
   * currently, so we ignore it until we encounter it in the wild.
   * Look at what is done for RGB parser if need be.
   */
  const parseModern = pair(
    parseTriplet(option(Token.parseWhitespace)),
    Triplet.parseAlpha,
  );

  const parseLegacy = pair(
    parseTriplet(
      delimited(option(Token.parseWhitespace), Token.parseComma),
      true,
    ),
    Triplet.parseAlphaLegacy,
  );
  /**
   * {@link https://drafts.csswg.org/css-color/#funcdef-hsl}
   */
  export const parse: CSSParser<HSL> = map(
    Function.parse(["hsl", "hsla"], either(parseLegacy, parseModern)),
    (result) => {
      const [, [[hue, saturation, lightness], alpha]] = result;

      return HSL.of(hue, saturation, lightness, alpha);
    },
  );
}

/**
 * {@link https://drafts.csswg.org/css-color/#hsl-to-rgb}
 */
function hslToRgb(
  hue: number,
  saturation: number,
  lightness: number,
): [number, number, number] {
  const t2 =
    lightness <= 0.5
      ? lightness * (saturation + 1)
      : lightness + saturation - lightness * saturation;

  const t1 = lightness * 2 - t2;

  return [
    hueToRgb(t1, t2, Real.modulo(hue + 2, 6)),
    hueToRgb(t1, t2, hue),
    hueToRgb(t1, t2, Real.modulo(hue - 2, 6)),
  ];
}

/**
 * {@link https://drafts.csswg.org/css-color/#hsl-to-rgb}
 */
function hueToRgb(t1: number, t2: number, hue: number): number {
  if (hue < 1) {
    return t1 + (t2 - t1) * hue;
  }

  if (hue < 3) {
    return t2;
  }

  if (hue < 4) {
    return t1 + (t2 - t1) * (4 - hue);
  }

  return t1;
}
