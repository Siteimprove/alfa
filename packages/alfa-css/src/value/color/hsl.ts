import { Parser } from "@siteimprove/alfa-parser";

import * as json from "@siteimprove/alfa-json";

import { Token } from "../../syntax/token";
import { Angle } from "../angle";
import { Number } from "../number";
import { Percentage } from "../percentage";
import { Color } from "../color";

const { pair, map, either, option, left, right, take, delimited } = Parser;

export class HSL<
  H extends Number | Angle = Number | Angle,
  A extends Number | Percentage = Number | Percentage
> implements Color {
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
  private readonly _alpha: A;

  private constructor(
    hue: H,
    saturation: Percentage,
    lightness: Percentage,
    alpha: A
  ) {
    this._hue = hue;
    this._saturation = saturation;
    this._lightness = lightness;
    this._alpha = alpha;
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

  public get red(): Number {
    return Number.of(0);
  }

  public get green(): Number {
    return Number.of(0);
  }

  public get blue(): Number {
    return Number.of(0);
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

  public toJSON(): HSL.JSON {
    return {
      type: "color",
      format: "hsl",
      hue: this._hue.toJSON(),
      saturation: this._saturation.toJSON(),
      lightness: this._lightness.toJSON(),
      alpha: this._alpha.toJSON()
    };
  }

  public toString(): string {
    return `hsl(${this._hue} ${this._saturation} ${this._lightness}${
      this._alpha.value === 1 ? "" : ` / ${this._alpha}`
    })`;
  }
}

export namespace HSL {
  export interface JSON {
    [key: string]: json.JSON;
    type: "color";
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
   * @see https://drafts.csswg.org/css-color/#typedef-alpha-value
   */
  const parseAlpha = either(Number.parse, Percentage.parse);

  /**
   * @see https://drafts.csswg.org/css-color/#typedef-hue
   */
  const parseHue = either(Number.parse, Angle.parse);

  /**
   * @see https://drafts.csswg.org/css-color/#funcdef-hsl
   */
  export const parse = map(
    right(
      Token.parseFunction(fn => fn.value === "hsl" || fn.value === "hsla"),
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
    result => {
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
