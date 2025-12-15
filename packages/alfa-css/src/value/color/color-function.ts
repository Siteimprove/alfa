import type { Hash } from "@siteimprove/alfa-hash";
import { Real } from "@siteimprove/alfa-math";
import { Parser } from "@siteimprove/alfa-parser";

import {
  Function,
  type Parser as CSSParser,
  Token,
} from "../../syntax/index.js";

import { Number, Percentage } from "../numeric/index.js";

import { ColorSpace } from "./converters.js";
import { Format } from "./format.js";
import { RGB } from "./rgb.js";
import { Triplet } from "./triplet.js";

const { either, map, pair } = Parser;

type Space = ColorSpace.ColorSpace | "display-p3-linear" | "sRGB-linear";
/** @internal */
export const ColorSpaces: Array<Space> = [
  "display-p3-linear",
  "sRGB-linear",
  ...ColorSpace.colorSpaces,
];

/**
 * {@link https://drafts.csswg.org/css-color/#the-hsl-notation}
 *
 * @public
 */
export class ColorFunction<N extends Space = Space> extends Triplet<N> {
  public static of<N extends Space>(
    name: N,
    c1: Number | Percentage<"percentage">,
    c2: Number | Percentage<"percentage">,
    c3: Number | Percentage<"percentage">,
    alpha: Number | Percentage<"percentage">,
  ): ColorFunction<N> {
    return new ColorFunction(
      name,
      c1.resolve(),
      c2.resolve(),
      c3.resolve(),
      alpha.resolve(),
    );
  }

  // The three input components
  private readonly _c1: ColorFunction.Component;
  private readonly _c2: ColorFunction.Component;
  private readonly _c3: ColorFunction.Component;
  // The RGB value, in the default sRBG colorspace (aka rgb() CSS function)
  private readonly _red: Percentage.Canonical;
  private readonly _green: Percentage.Canonical;
  private readonly _blue: Percentage.Canonical;

  protected constructor(
    name: N,
    c1: ColorFunction.Component,
    c2: ColorFunction.Component,
    c3: ColorFunction.Component,
    alpha: Triplet.Alpha,
  ) {
    super(name, alpha);
    this._c1 = c1;
    this._c2 = c2;
    this._c3 = c3;

    [this._red, this._green, this._blue] = ColorSpace.convertRGB(
      {
        space:
          name === "sRGB-linear"
            ? "sRGB"
            : name === "display-p3-linear"
              ? "display-p3"
              : name,
        linear: name === "sRGB-linear" || name === "display-p3-linear",
        components: [
          Real.clamp(c1.value, 0, 1),
          Real.clamp(c2.value, 0, 1),
          Real.clamp(c3.value, 0, 1),
        ],
      },
      { space: "sRGB", linear: false },
    ).components.map((c) => Percentage.of<"percentage">(c));
  }

  public get components(): [
    ColorFunction.Component,
    ColorFunction.Component,
    ColorFunction.Component,
  ] {
    return [this._c1, this._c2, this._c3];
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
      value instanceof ColorFunction &&
      value._c1.equals(this._c1) &&
      value._c2.equals(this._c2) &&
      value._c3.equals(this._c3) &&
      value._alpha.equals(this._alpha)
    );
  }

  public hash(hash: Hash): void {
    hash
      .writeString(this._format)
      .writeHashable(this._c1)
      .writeHashable(this._c2)
      .writeHashable(this._c3)
      .writeHashable(this._alpha);
  }

  public toJSON(): ColorFunction.JSON<N> {
    return {
      ...super.toJSON(),
      c1: this._c1.toJSON(),
      c2: this._c2.toJSON(),
      c3: this._c3.toJSON(),
    };
  }

  public toString(): string {
    return `color(${this._format} ${this._c1} ${this._c2} ${this._c3} ${
      this._alpha.value === 1 ? "" : ` / ${this._alpha}`
    })`;
  }
}

/**
 * @public
 */
export namespace ColorFunction {
  export interface JSON<N extends Space = Space> extends Triplet.JSON<N> {
    c1: Number.Fixed.JSON | Percentage.Fixed.JSON;
    c2: Number.Fixed.JSON | Percentage.Fixed.JSON;
    c3: Number.Fixed.JSON | Percentage.Fixed.JSON;
  }

  /** @internal */
  export type Component = Number.Canonical | Percentage.Canonical;

  export function isColorFunction(value: unknown): value is ColorFunction {
    return value instanceof ColorFunction;
  }

  /**
   * {@link https://drafts.csswg.org/css-color/#typedef-hue}
   */
  const parseComponent = either(Number.parse, Percentage.parse<"percentage">);

  /**
   * {@link https://drafts.csswg.org/css-color/#funcdef-hsl}
   */
  export const parse: CSSParser<ColorFunction> = map(
    Function.parse(
      "color",
      pair(
        Token.parseIdent(ColorSpaces),
        Triplet.parseTriplet([parseComponent]),
      ),
    ),
    ([, [colorSpace, [c1, c2, c3, alpha]]]) =>
      ColorFunction.of(colorSpace.value, c1, c2, c3, alpha),
  );
}
