import { Hash } from "@siteimprove/alfa-hash";
import { Real } from "@siteimprove/alfa-math";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../syntax/token";
import { Value } from "../../value";

import { Angle } from "../angle";
import { Number } from "../number";
import { Percentage } from "../percentage";

const { pair, map, either, option, left, right, take, delimited } = Parser;

/**
 * @public
 */
export class HSL<
  H extends Number | Angle = Number | Angle,
  A extends Number | Percentage = Number | Percentage
> extends Value<"color"> {
  public static of<H extends Number | Angle, A extends Number | Percentage>(
    hue: H,
    saturation: Percentage,
    lightness: Percentage,
    alpha: A
  ): HSL<H, A> {
    return new HSL(hue, saturation, lightness, alpha);
  }

  private readonly _hue: H;
  private readonly _saturation: Percentage;
  private readonly _lightness: Percentage;
  private readonly _red: Percentage;
  private readonly _green: Percentage;
  private readonly _blue: Percentage;
  private readonly _alpha: A;

  private constructor(
    hue: H,
    saturation: Percentage,
    lightness: Percentage,
    alpha: A
  ) {
    super();
    this._hue = hue;
    this._saturation = saturation;
    this._lightness = lightness;
    this._alpha = alpha;

    const degrees = Angle.isAngle(hue) ? hue.withUnit("deg").value : hue.value;

    const [red, green, blue] = hslToRgb(
      Real.modulo(degrees, 360) / 60,
      Real.clamp(saturation.value, 0, 1),
      Real.clamp(lightness.value, 0, 1)
    );

    this._red = Percentage.of(red);
    this._green = Percentage.of(green);
    this._blue = Percentage.of(blue);
  }

  public get type(): "color" {
    return "color";
  }

  public get format(): "hsl" {
    return "hsl";
  }

  public get hue(): H {
    return this._hue;
  }

  public get saturation(): Percentage {
    return this._saturation;
  }

  public get lightness(): Percentage {
    return this._lightness;
  }

  public get red(): Percentage {
    return this._red;
  }

  public get green(): Percentage {
    return this._green;
  }

  public get blue(): Percentage {
    return this._blue;
  }

  public get alpha(): A {
    return this._alpha;
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
      type: "color",
      format: "hsl",
      hue: this._hue.toJSON(),
      saturation: this._saturation.toJSON(),
      lightness: this._lightness.toJSON(),
      alpha: this._alpha.toJSON(),
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
  export interface JSON extends Value.JSON<"color"> {
    format: "hsl";
    hue: Number.JSON | Angle.JSON;
    saturation: Percentage.JSON;
    lightness: Percentage.JSON;
    alpha: Number.JSON | Percentage.JSON;
  }

  export function isHSL<
    H extends Number | Angle,
    A extends Number | Percentage
  >(value: unknown): value is HSL<H, A> {
    return value instanceof HSL;
  }

  /**
   * {@link https://drafts.csswg.org/css-color/#typedef-alpha-value}
   */
  const parseAlpha: Parser<Slice<Token>, Number | Percentage, string> = either(
    Number.parse,
    Percentage.parse
  );

  /**
   * {@link https://drafts.csswg.org/css-color/#typedef-hue}
   */
  const parseHue: Parser<Slice<Token>, Number | Angle, string> = either(
    Number.parse,
    Angle.parse
  );

  /**
   * {@link https://drafts.csswg.org/css-color/#funcdef-hsl}
   */
  export const parse: Parser<Slice<Token>, HSL, string> = map(
    right(
      Token.parseFunction((fn) => fn.value === "hsl" || fn.value === "hsla"),
      left(
        delimited(
          option(Token.parseWhitespace),
          either(
            pair(
              pair(
                parseHue,
                take(right(option(Token.parseWhitespace), Percentage.parse), 2)
              ),
              option(
                right(
                  delimited(
                    option(Token.parseWhitespace),
                    Token.parseDelim("/")
                  ),
                  parseAlpha
                )
              )
            ),
            pair(
              pair(
                parseHue,
                take(
                  right(
                    delimited(option(Token.parseWhitespace), Token.parseComma),
                    Percentage.parse
                  ),
                  2
                )
              ),
              option(
                right(
                  delimited(option(Token.parseWhitespace), Token.parseComma),
                  parseAlpha
                )
              )
            )
          )
        ),
        Token.parseCloseParenthesis
      )
    ),
    (result) => {
      const [[hue, [saturation, lightness]], alpha] = result;

      return HSL.of(
        hue,
        saturation,
        lightness,
        alpha.getOrElse(() => Number.of(1))
      );
    }
  );
}

/**
 * {@link https://drafts.csswg.org/css-color/#hsl-to-rgb}
 */
function hslToRgb(
  hue: number,
  saturation: number,
  lightness: number
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
