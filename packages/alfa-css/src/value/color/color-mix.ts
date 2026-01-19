import type { Hash } from "@siteimprove/alfa-hash";
import { List } from "../collection/index.js";
import type { PartiallyResolvable, Resolvable } from "../resolvable.js";
import { Value } from "../value.js";
import { CSS4Color } from "./css4-color.js";
import { Mix, MixItem } from "./mix.js";

import type { Color } from "./color.js";

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
  S extends ColorMix.InterpolationSpace,
  H extends ColorMix.HueInterpolationMethod = "shorter",
>
  extends Value<"color-mix", true, "color", "color" | "color-mix">
  implements
    Resolvable<CSS4Color, ColorMix.Resolver>,
    PartiallyResolvable<CSS4Color | ColorMix<S, H>, ColorMix.PartialResolver>
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

  public resolve(resolver: ColorMix.Resolver): CSS4Color {
    const resolvedColors = this._colors.map((item) => item.resolve(resolver));

    return CSS4Color.of("todo").getUnsafe(); // TODO
  }

  public partiallyResolve(
    resolver: ColorMix.PartialResolver,
  ): CSS4Color | ColorMix<S, H> {
    return CSS4Color.of("todo").getUnsafe(); // TODO
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
      hueMethod: this._hueMethod,
      colors: this._colors.toJSON(),
    };
  }

  public toString(): string {
    const hue = ColorMix.isPolar(this._space) ? "" : ` ${this._hueMethod} hue`;

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
    hueMethod: H;
    colors: List.JSON<MixItem<Color>>;
  }

  export interface Resolver {
    currentColor: CSS4Color.Canonical;
  }

  export interface PartialResolver {}

  const interpolationSpaces = [
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
    "hsl",
    "hwb",
    "lch",
    "oklch",
  ] as const;

  export type InterpolationSpace = (typeof interpolationSpaces)[number];

  export function isPolar(space: InterpolationSpace): boolean {
    return (
      space === "hsl" || space === "hwb" || space === "lch" || space === "oklch"
    );
  }

  const hueInterpolationMethods = [
    "shorter",
    "longer",
    "increasing",
    "decreasing",
  ] as const;

  export type HueInterpolationMethod = (typeof hueInterpolationMethods)[number];
}
