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

import type { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";

import CSSColor from "colorjs.io";

import {
  Function,
  type Parser as CSSParser,
  Token,
} from "../../syntax/index.js";
import { Number, Percentage } from "../numeric/index.js";

import type { Resolvable } from "../resolvable.js";
import { Value } from "../value.js";

const { exclusive, map, mapResult } = Parser;

export class ColorFoo
  extends Value<"color", false>
  implements Resolvable<ColorFoo.Canonical, never>
{
  public static of(color: CSSColor): ColorFoo {
    return new ColorFoo(color);
  }

  private readonly _color: CSSColor;
  // We use the sRGB color space as the canonical representation for colors
  // for historical reasons.
  private readonly _srgb: CSSColor;

  protected constructor(color: CSSColor) {
    super("color", false);
    this._color = color;

    this._srgb = color.to("srgb");
  }

  /**
   * The underlying colorjs.io color.
   */
  public get color(): CSSColor {
    return this._color;
  }

  public get red(): Percentage.Canonical {
    return Percentage.of<"percentage">(this._srgb.r ?? 0);
  }

  public get green(): Percentage.Canonical {
    return Percentage.of<"percentage">(this._srgb.g ?? 0);
  }

  public get blue(): Percentage.Canonical {
    return Percentage.of<"percentage">(this._srgb.b ?? 0);
  }

  public get alpha(): Number.Canonical {
    return Number.of(this._color.alpha ?? 1);
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
      sRGB: [this._srgb.r ?? 0, this._srgb.g ?? 0, this._srgb.b ?? 0],
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
    sRGB: [number, number, number];
    alpha: Number.Fixed.JSON;
  }

  export type Canonical = ColorFoo;

  const parseHash: CSSParser<CSSColor> = mapResult(
    Token.parseHash(),
    (hash) => {
      try {
        return Result.of<CSSColor, string>(new CSSColor(`${hash}`));
      } catch (e) {
        return Err.of(`Couldn't parse color function: ${hash} -- ${e}`);
      }
    },
  );

  const parseFunction: CSSParser<CSSColor> = mapResult(
    Function.parse(),
    ([func]) => {
      try {
        return Result.of<CSSColor, string>(new CSSColor(func.toString()));
      } catch (e) {
        return Err.of(`Couldn't parse color function: ${func} -- ${e}`);
      }
    },
  );

  const parseIdent: CSSParser<CSSColor> = mapResult(
    Token.parseIdent(),
    (ident) => {
      try {
        return Result.of<CSSColor, string>(new CSSColor(ident.value));
      } catch (e) {
        return Err.of(`Unknown color keyword: ${ident.value} -- ${e}`);
      }
    },
  );

  const parseColor: CSSParser<CSSColor> = exclusive(
    [
      [Token.parseFunction(), parseFunction],
      [Token.parseHash(), parseHash],
      [Token.parseIdent(), parseIdent],
    ],
    (input) => `${input} is not a valid CSS color`,
  );

  export const parse: CSSParser<ColorFoo> = map(parseColor, ColorFoo.of);
}
