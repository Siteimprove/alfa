import type { Hash } from "@siteimprove/alfa-hash";
import type { Option, Some } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";
import { Selective } from "@siteimprove/alfa-selective";
import { Function, Token } from "../../syntax/index.js";
import type { Parser as CSSParser } from "../../syntax/parser.js";

import type { List } from "../collection/index.js";
import { Percentage } from "../numeric/index.js";

import type { PartiallyResolvable, Resolvable } from "../resolvable.js";
import { Keyword } from "../textual/index.js";
import { Value } from "../value.js";

import type { Color } from "./color.js";

import { CSS4Color } from "./css4-color.js";
import { Current } from "./current.js";
import { Mix, MixItem } from "./mix.js";
import { System } from "./system.js";

const { left, map, mapResult, option, pair, right, separated } = Parser;

/**
 * {@link https://drafts.csswg.org/css-color-5/#color-mix}
 *
 * @remarks
 * Browsers seems to only support 2 colors at a time, and always require
 * an interpolation space. However, specs allow for unlimited colors, and use
 * oklab as default space if unspecified. This follows specs and is therefore
 * more capable than current (2026) browsers.
 *
 * @privateRemarks
 * The extra capacity should not create false positives as we assume that authors
 * do not rely on browsers rejecting a long color-mix and defaulting to
 * unspecified value instead.
 *
 * @public
 */
// While color-mix() are not calculations per se, we consider that they are,
// resolving to base colors.
// When `currentcolor` is involved, they are only partially resolved.
export class ColorMix<
  S extends ColorMix.InterpolationSpace = ColorMix.InterpolationSpace,
  H extends ColorMix.HueInterpolationMethod = ColorMix.HueInterpolationMethod,
>
  extends Value<"color-mix", true, "color", "color" | "color-mix">
  implements
    Resolvable<CSS4Color, Color.Resolver>,
    PartiallyResolvable<CSS4Color | ColorMix<S, H>, never>
{
  /**
   * Creates a color mix in the default oklab space.
   */
  public static of(colors: List<MixItem<Color>>): ColorMix<"oklab">;

  /**
   * Creates a color mix in the indicated space, if polar, the "shorter" hue
   * interpolation method is used.
   */
  public static of<S extends ColorMix.InterpolationSpace>(
    colors: List<MixItem<Color>>,
    space: S,
  ): ColorMix<S>;

  /**
   * Creates a color mix in the indicated space and hue interpolation method.
   */
  public static of<
    S extends ColorMix.InterpolationSpace,
    H extends ColorMix.HueInterpolationMethod,
  >(colors: List<MixItem<Color>>, space: S, hueMethod: H): ColorMix<S, H>;

  public static of<
    S extends ColorMix.InterpolationSpace = "oklab",
    H extends ColorMix.HueInterpolationMethod = "shorter",
  >(
    colors: List<MixItem<Color>>,
    space?: S,
    hueMethod?: H,
  ): ColorMix<S | "oklab", H | "shorter"> {
    return new ColorMix(colors, space ?? "oklab", hueMethod ?? "shorter");
  }

  protected _space: S;
  protected _hueMethod: H;
  protected _colors: List<MixItem<Color>>;

  private constructor(colors: List<MixItem<Color>>, space: S, hueMethod: H) {
    super("color-mix", true);

    this._colors = colors;
    this._space = space;
    this._hueMethod = hueMethod;
  }

  public get colors(): List<MixItem<Color>> {
    return this._colors;
  }

  public get space(): S {
    return this._space;
  }

  public get hueMethod(): H {
    return this._hueMethod;
  }

  // We can't directly use item.(partially)Resolve because it doesn't work
  // nicely with keyword colors (`currentcolor` and system colors).
  // We can't directly use Color.(partially)Resolve because it would create
  // circular dependencies.
  private static resolveColor(color: Color): CSS4Color | Current;

  private static resolveColor(
    color: Color,
    resolver: Color.Resolver,
  ): CSS4Color;

  private static resolveColor(
    color: Color,
    resolver?: Color.Resolver,
  ): CSS4Color | Current {
    return Selective.of(color)
      .if(System.isSystem, System.resolve)
      .if(Current.isCurrent, (color) =>
        resolver === undefined ? color : resolver.currentColor,
      )
      .get();
  }

  public resolve(resolver: Color.Resolver): CSS4Color {
    const resolvedColors = this._colors.map((item) =>
      MixItem.of(
        ColorMix.resolveColor(item.value, resolver),
        item.percentage.map((percentage) => percentage.resolve()),
      ),
    );

    return ColorMix.calculate(resolvedColors, this._space, this._hueMethod);
  }

  public partiallyResolve(): CSS4Color | ColorMix<S, H> {
    // System colors can be resolved now, but `currentcolor` cannot.
    const resolvedColors = this._colors.map((item) =>
      MixItem.of(
        ColorMix.resolveColor(item.value),
        item.percentage.map((percentage) => percentage.resolve()),
      ),
    );

    if (
      resolvedColors.every((item): item is MixItem<CSS4Color> =>
        CSS4Color.isCSS4Color(item.value),
      )
    ) {
      return ColorMix.calculate(resolvedColors, this._space, this._hueMethod);
    } else {
      return ColorMix.of(resolvedColors, this._space, this._hueMethod);
    }
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof ColorMix &&
      this._space === value._space &&
      this._hueMethod === value._hueMethod &&
      this._colors.equals(value._colors)
    );
  }

  public hash(hash: Hash): void {
    hash.writeString(this.type);
    hash.writeString(this._space);
    hash.writeString(this._hueMethod);
    this._colors.hash(hash);
  }

  public toJSON(): ColorMix.JSON<S, H> {
    return {
      ...super.toJSON(),
      space: this._space,
      hueMethod: ColorMix.isPolar(this._space) ? this._hueMethod : null,
      colors: this._colors.toJSON(),
    };
  }

  public toString(): string {
    const hue = ColorMix.isPolar(this._space) ? ` ${this._hueMethod} hue` : "";

    return `color-mix(in ${this._space}${hue}, ${this._colors})`;
  }
}

/**
 * @public
 */
export namespace ColorMix {
  export interface JSON<
    S extends InterpolationSpace,
    H extends HueInterpolationMethod,
  > extends Value.JSON<"color-mix"> {
    space: S;
    hueMethod: H | null;
    colors: List.JSON<MixItem<Color>>;
  }

  /** @internal */
  export const rectangularSpaces = [
    "srgb",
    "srgb-linear",
    "display-p3",
    "display-p3-linear",
    "a98-rgb",
    "prophoto-rgb",
    "rec2020",
    "lab",
    "oklab",
    "xyz",
    "xyz-d50",
    "xyz-d65",
  ] as const;

  /** @internal */
  export const polarSpaces = ["hsl", "hwb", "lch", "oklch"] as const;

  export const interpolationSpaces = [
    ...rectangularSpaces,
    ...polarSpaces,
  ] as const;

  export type InterpolationSpace = (typeof interpolationSpaces)[number];

  export function isPolar(space: InterpolationSpace): boolean {
    return (polarSpaces as ReadonlyArray<string>).includes(space);
  }

  /**
   * Convert CSS color spaces names to ColorJS.io space identifiers.
   */
  const spaceId: { [K in InterpolationSpace]: string } = {
    srgb: "srgb",
    "srgb-linear": "srgb-linear",
    "display-p3": "p3",
    "display-p3-linear": "p3-linear",
    "a98-rgb": "a98rgb",
    "prophoto-rgb": "prophoto",
    rec2020: "rec2020",
    lab: "lab",
    oklab: "oklab",
    xyz: "xyz",
    "xyz-d50": "xyz-d50",
    "xyz-d65": "xyz-d65",
    hsl: "hsl",
    hwb: "hwb",
    lch: "lch",
    oklch: "oklch",
  };

  /** @internal */
  export const hueInterpolationMethods = [
    "shorter",
    "longer",
    "increasing",
    "decreasing",
  ] as const;

  export type HueInterpolationMethod = (typeof hueInterpolationMethods)[number];

  type ColorItem = MixItem<CSS4Color, Some<Percentage.Fixed>>;

  function mixColorItems(
    space: InterpolationSpace,
    hue: HueInterpolationMethod,
  ): (color1: ColorItem, color2: ColorItem) => ColorItem {
    return (color1, color2) => {
      const p1 = color1.percentage.get().value;
      const p2 = color2.percentage.get().value;

      return MixItem.of(
        CSS4Color.of(
          color1.value.color.mix(
            color2.value.color,
            p2 / (p1 + p2), // this is the proportion of color2 in the mix.
            { space: spaceId[space], hue },
          ),
        ),
        Percentage.of(p1 + p2),
      );
    };
  }

  /**
   * Calculates the result of a color-mix, given that all colors are already
   * resolved to CSS4Color.
   * {@see https://drafts.csswg.org/css-color-5/#color-mix-result}
   *
   * @internal
   */
  export function calculate(
    colors: List<MixItem<CSS4Color>>,
    space: InterpolationSpace,
    hue: HueInterpolationMethod,
  ): CSS4Color {
    const transparent = CSS4Color.of("transparent").getUnsafe();

    // 1.
    const [normalized, leftover] = Mix.normalize(colors);

    // 2.
    if (leftover.value === 1) {
      // Because we restrict the list of allowed spaces, the conversion
      // should not fail.
      return transparent.toSpace(spaceId[space]).getUnsafe();
    }

    // 3.
    const alphaMult = 1 - leftover.value;

    // 4. is describing a reduce operation. Our list is already in the correct
    // order, so we do not need to reverse it (4.1). Due to the progress
    // percentage in 4.2.2 (a/(a+b) vs b/(a+b)), the neutral element is anything
    // with a percentage (a or b) of 0, so we can use that directly for our
    // initial accumulator.
    const reduced = normalized.values.reduce(
      mixColorItems(space, hue),
      MixItem.of(transparent, Percentage.of(0)),
    );

    // 5., 6.
    return reduced.value.withAlpha(alphaMult * reduced.value.alpha.value);
  }

  const parseSpace: CSSParser<InterpolationSpace> = map(
    separated(
      Keyword.parse("in"),
      Token.parseWhitespace,
      Keyword.parse(...interpolationSpaces),
    ),
    ([, space]) => space.value,
  );

  const parseHueMethod: CSSParser<HueInterpolationMethod> = map(
    left(
      Keyword.parse(...hueInterpolationMethods),
      Token.parseWhitespace,
      Keyword.parse("hue"),
    ),
    (hueMethod) => hueMethod.value,
  );

  const parseInterpolation: CSSParser<
    [InterpolationSpace, Option<HueInterpolationMethod>]
  > = mapResult(
    pair(parseSpace, option(right(Token.parseWhitespace, parseHueMethod))),
    ([space, hue]) =>
      isPolar(space) || hue.isNone()
        ? Result.of<
            [InterpolationSpace, Option<HueInterpolationMethod>],
            string
          >([space, hue])
        : Err.of(
            "Hue interpolation method is forbidden with rectangular color spaces.",
          ),
  );

  /**
   * Parses a `color-mix()` function, according to a basic color parser.
   *
   * @param parseColor - A parser for colors used within the color mix.
   */
  export function parse(parseColor: CSSParser<Color>): CSSParser<ColorMix> {
    return map(
      Function.parse(
        "color-mix",
        pair(
          option(
            left(parseInterpolation, Token.parseComma, Token.parseWhitespace),
          ),
          mapResult(Mix.parse(parseColor), (colors) =>
            colors.none((item) =>
              item.percentage.some(
                (percentage) => percentage.value < 0 || percentage.value > 1,
              ),
            )
              ? Result.of(colors)
              : Err.of("Percentages in color-mix must be between 0 and 100%."),
          ),
        ),
      ),
      ([, [interpolation, colors]]) =>
        ColorMix.of(
          colors,
          interpolation.map(([space]) => space).getOr("oklab"),
          interpolation.flatMap(([, hueMethod]) => hueMethod).getOr("shorter"),
        ),
    );
  }
}
