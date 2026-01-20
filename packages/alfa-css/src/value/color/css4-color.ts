/*
 * This file uses the colorjs.io library to parse CSS4 colors.
 *
 * While we normally avoid external dependencies, according to
 * [ADR 5: Don't depend on third party code to produce results](https://github.com/Siteimprove/alfa/blob/main/docs/architecture/decisions/adr-005.md),
 * we make an exception here.
 * * colorjs.io itself has no dependencies, so we do not include too much.
 * * colorjs.io is maintained by the CSS editors (even though not part of W3C),
 *   so it will be kept up to date with CSS color specifications.
 * * colorjs.io is used by many, notably by browsers themselves.
 * * Previous implementations of CSS color handling in Alfa was mostly done by
 *   copying code from the CSS specification, itself copied from colorjs.io.
 *   While this was acceptable for a couple of functions (e.g. when we only had
 *   rgb() and hsl()), this can easily get out of hand for broader support.
 *
 * The main difficulty in using colorjs.io is the difference in API design with
 * Alfa. Notably, colorjs.io uses exceptions and mutable objects. Thus, we wrap
 * things in an Alfa layer.
 *
 * The other difficulties are the lack of support for calculations, that we
 * need to resolve beforehand; and the parser working on strings, while Alfa
 * provides already tokenized inputs.
 *
 * colorjs.io currently supports all the CSS4 color formats, but not the CSS5.
 * Hence we'll need our own support of, e.g., `color-mix` and relative colors.
 * These can still use colorjs.io functionalities to resolve the colors.
 */

import { Array } from "@siteimprove/alfa-array";
import type { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import Color from "colorjs.io";

import {
  Function,
  type Parser as CSSParser,
  Token,
} from "../../syntax/index.js";
import { Angle, Number, Percentage } from "../numeric/index.js";

import type { Resolvable } from "../resolvable.js";
import { Value } from "../value.js";

const { either, map, mapResult, zeroOrMore } = Parser;

/**
 * @public
 */
export class CSS4Color
  extends Value<"color", false>
  implements Resolvable<CSS4Color.Canonical, never>
{
  public static of(color: Color): CSS4Color;

  public static of(color: string): Result<CSS4Color, Error>;

  public static of(
    space: string,
    coords: [number | null, number | null, number | null],
    alpha?: number | null,
  ): Result<CSS4Color, Error>;

  public static of(
    spaceOrColor: string | Color,
    coords?: [number | null, number | null, number | null],
    alpha: number | null = 1,
  ): CSS4Color | Result<CSS4Color, Error> {
    if (typeof spaceOrColor === "string") {
      // The color string might be invalid, so Color constructor may throw.
      // The space might not exist, so Color constructor may throw.
      try {
        const color =
          coords === undefined
            ? new Color(spaceOrColor)
            : new Color(spaceOrColor, coords, alpha);

        return Ok.of(new CSS4Color(color));
      } catch (e) {
        return Err.of(e as Error);
      }
    } else {
      return new CSS4Color(spaceOrColor);
    }
  }

  private readonly _color: Color;

  // We use the sRGB color space as the canonical representation for colors
  // for historical reasons. We may want to switch to XYZ-D65 at some point, as
  // it is the root space in colorjs.io. This might however require a lot of
  // refactoring.
  private readonly _srgb: Color;
  private readonly _red: Percentage.Canonical;
  private readonly _green: Percentage.Canonical;
  private readonly _blue: Percentage.Canonical;
  private readonly _alpha: Percentage.Canonical;

  protected constructor(color: Color) {
    super("color", false);
    this._color = color;

    this._srgb = color.to("srgb");

    this._red = Percentage.of<"percentage">(this._srgb.r ?? 0);
    this._green = Percentage.of<"percentage">(this._srgb.g ?? 0);
    this._blue = Percentage.of<"percentage">(this._srgb.b ?? 0);
    this._alpha = Percentage.of(this._color.alpha ?? 1);
  }

  /**
   * The underlying colorjs.io color.
   *
   * @remarks
   * This creates a new Color instance, rather than returning the internal one.
   * This is because Color instances are mutable, and we want to preserve the
   * immutability of Alfa values. If we were to return `this._color`, then
   * `alfaColor.color.r = 0` would modify the CSS4Color instance.
   */
  public get color(): Color {
    return this._color.clone();
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

  public get alpha(): Percentage.Canonical {
    return this._alpha;
  }

  public resolve(): CSS4Color.Canonical {
    return this;
  }

  /**
   * Computes the contrast between two colors, according to WCAG 2.1 algorithm.
   *
   * @privateRemarks
   * Having it available internally avoids the need to call
   * `color1.color.contrast(color2.color, "WCAG21")` which would create two new
   * Color instances. Given that we tend to compute a high number of pairings,
   * this should help performances.
   */
  public contrast(other: CSS4Color): number {
    return this._color.contrast(other._color, "WCAG21");
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof CSS4Color &&
      // We consider two colors equals if they have the same sRGB representation.
      this._red.equals(value._red) &&
      this._green.equals(value._green) &&
      this._blue.equals(value._blue) &&
      this._alpha.equals(value._alpha)
    );
  }

  public hash(hash: Hash) {
    hash.writeString(this._color.toString());
  }

  public toJSON(): CSS4Color.JSON {
    return {
      ...super.toJSON(),
      space: this._color.space.id,
      // We round coordinates at the same precision as our other Numeric types.
      coordinates: this._color.coords.map((c) =>
        c === null ? null : Number.of(c).value,
      ) as [number | null, number | null, number | null],
      sRGB: Array.toJSON([this._red, this._green, this._blue]) as [
        Percentage.Fixed.JSON,
        Percentage.Fixed.JSON,
        Percentage.Fixed.JSON,
      ],
      alpha: this.alpha.toJSON(),
    };
  }

  public toString(): string {
    return this._color.toString();
  }
}

/**
 * @public
 */
export namespace CSS4Color {
  export interface JSON extends Value.JSON<"color"> {
    space: string;
    coordinates: [number | null, number | null, number | null];
    sRGB: [Percentage.Fixed.JSON, Percentage.Fixed.JSON, Percentage.Fixed.JSON];
    alpha: Percentage.Fixed.JSON;
  }

  export type Canonical = CSS4Color;

  /*
   * The colorjs.io parser works on strings, but we receive pre-tokenized input.
   * So, we need to reconstruct strings. Moreover, the colorjs.io expects the
   * string to end with the end of the color, while we may parse colors as part
   * of larger inputs. So, we also need to cut the input to the color only.
   * Finally, the colorjs.io parser may throw an exception, that we need to
   * catch and use a Result instead.
   *
   * The CSS4 colors can either be a hash color (#rrggbb), a named one (red),
   * or a function (rgb(), hsl(), lab(), …). The various cases are easily
   * differentiated on the first token, but we still need to handle each case
   * separately.
   */

  /**
   * Parses the input, stringify the parsed value and send it to colorjs.io.
   */
  function catcher<T>(
    parser: CSSParser<T>,
    stringifier: (parsed: T) => string,
  ): CSSParser<Color> {
    return mapResult(parser, (parsed) => {
      try {
        return Result.of<Color, string>(new Color(stringifier(parsed)));
      } catch (e) {
        return Err.of(`Couldn't parse color: ${stringifier(parsed)} -- ${e}`);
      }
    });
  }

  const parseHash: CSSParser<Color> = catcher(
    Token.parseHash(),
    (hash) => `${hash}`,
  );

  const parseIdent: CSSParser<Color> = catcher(
    Token.parseIdent(),
    (ident) => ident.value,
  );

  /*
   * colorjs.io doesn't handle calculations, so we have to do it ourselves.
   *
   * Fortunately, the components in CSS colors cannot be "mixed" types, e.g.
   * there is no <angle-percentage> or the like, hues are <angle> | <number>,
   * and others are <number> | <percentage>. Hence, we always have "pure"
   * calculations and never need to interpolate percentages ourselves.
   *
   * For example, the `a` component in lab ranges from -125 (-100%) to 125
   * (100%), but is always expressed as either a number or a percentage, never
   * a mix. So, we can have "50%" (resolving to 62.5), or "calc(25% + 25%)", or
   * calc(10 + 20), but never "calc(50% + 20)".
   *
   * That means, that we do not care about evaluating the percentages.
   * "calc(30% + 20%)" can be simplified to "50%" and sent to colorjs.io, without
   * us needing to resolve "50%" to "62.5". Given that each format has different
   * ranges for its percentages, often on a per-component basis, this saves a
   * lot of complexity.
   *
   * The other good point is that colors don't include lengths, so we do not have
   * to resolve lengths which can only happens at compute value time due to relative
   * units. Hence, we can resolve everything at parse time before forwarding it
   * to colorjs.io.
   *
   * This simply tries to parse each of the possible numeric types, resolving
   * them as needed (takes care of the calculations), or accept the token as-is
   * (whitespace, "none", format in color(), …) The component is then stringified
   * for colorjs.io to parse again.
   */
  const parseComponent = either(
    map(
      either<Slice<Token>, Number | Percentage | Angle, string>(
        Number.parse,
        Percentage.parse,
        Angle.parse,
      ),
      (component) => component.resolve().toString(),
    ),
    map(Token.parseFirst, (token) => token.toString()),
  );

  const parseFunction: CSSParser<Color> = catcher(
    Function.parse(undefined, zeroOrMore(parseComponent)),
    ([func, body]) => `${func.name}(${body.join("")})`,
  );

  const parseColor: CSSParser<Color> = either(
    parseHash,
    parseIdent,
    parseFunction,
  );

  export const parse: CSSParser<CSS4Color> = map<
    Slice<Token>,
    Color,
    CSS4Color,
    string
  >(parseColor, CSS4Color.of);
}
