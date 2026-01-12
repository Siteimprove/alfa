/// <reference lib="dom" />
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
import { Err, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import CSSColor from "colorjs.io";

import {
  Function,
  type Parser as CSSParser,
  Token,
} from "../../syntax/index.js";
import { Angle, Number, Percentage } from "../numeric/index.js";

import type { Resolvable } from "../resolvable.js";
import { Value } from "../value.js";

const { either, map, mapResult, zeroOrMore } = Parser;

export class ColorFoo
  extends Value<"color", false>
  implements Resolvable<ColorFoo.Canonical, never>
{
  public static of(color: CSSColor): ColorFoo {
    return new ColorFoo(color);
  }

  private readonly _color: CSSColor;
  // We use the sRGB color space as the canonical representation for colors
  // for historical reasons. We may want to switch to XYZ-D65 at some point, as
  // it seems to be the root space in colorjs.io. This might however require a
  // lot of refactoring.
  private readonly _srgb: CSSColor;

  private readonly _red: Percentage.Canonical;
  private readonly _green: Percentage.Canonical;
  private readonly _blue: Percentage.Canonical;
  private readonly _alpha: Number.Canonical;

  protected constructor(color: CSSColor) {
    super("color", false);
    this._color = color;

    this._srgb = color.to("srgb");

    this._red = Percentage.of<"percentage">(this._srgb.r ?? 0);
    this._green = Percentage.of<"percentage">(this._srgb.g ?? 0);
    this._blue = Percentage.of<"percentage">(this._srgb.b ?? 0);
    this._alpha = Number.of(this._color.alpha ?? 1);
  }

  /**
   * The underlying colorjs.io color.
   */
  public get color(): CSSColor {
    return this._color;
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

  public get alpha(): Number.Canonical {
    return this._alpha;
  }

  public resolve(): ColorFoo.Canonical {
    return this;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof ColorFoo &&
      this._color.toString() === value._color.toString()
    );
  }

  public hash(hash: Hash) {
    hash.writeString(this._color.toString());
  }

  public toJSON(): ColorFoo.JSON {
    return {
      ...super.toJSON(),
      space: this._color.space.id,
      coordinates: this._color.coords,
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

export namespace ColorFoo {
  export interface JSON extends Value.JSON<"color"> {
    space: string;
    coordinates: [number | null, number | null, number | null];
    sRGB: [Percentage.Fixed.JSON, Percentage.Fixed.JSON, Percentage.Fixed.JSON];
    alpha: Number.Fixed.JSON;
  }

  export type Canonical = ColorFoo;

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
  ): CSSParser<CSSColor> {
    return mapResult(parser, (parsed) => {
      try {
        return Result.of<CSSColor, string>(new CSSColor(stringifier(parsed)));
      } catch (e) {
        return Err.of(`Couldn't parse color: ${stringifier(parsed)} -- ${e}`);
      }
    });
  }

  const parseHash: CSSParser<CSSColor> = catcher(
    Token.parseHash(),
    (hash) => `${hash}`,
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
   * to resolve length which can only happens at compute value time due to relative
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

  const parseFunction: CSSParser<CSSColor> = catcher(
    Function.parse(undefined, zeroOrMore(parseComponent)),
    ([func, body]) => `${func.name}(${body.join("")})`,
  );

  const parseIdent: CSSParser<CSSColor> = catcher(
    Token.parseIdent(),
    (ident) => ident.value,
  );

  const parseColor: CSSParser<CSSColor> = either(
    parseHash,
    parseIdent,
    parseFunction,
  );

  export const parse: CSSParser<ColorFoo> = map(parseColor, ColorFoo.of);
}
