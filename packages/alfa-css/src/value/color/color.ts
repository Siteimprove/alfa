import { Parser } from "@siteimprove/alfa-parser";
import { Refinement } from "@siteimprove/alfa-refinement";
import type { Result } from "@siteimprove/alfa-result";
import { Selective } from "@siteimprove/alfa-selective";
import type { Slice } from "@siteimprove/alfa-slice";

import type { Token } from "../../syntax/index.js";
import { Number, Percentage } from "../numeric/index.js";

import { Keyword } from "../textual/keyword.js";
import { ColorMix } from "./color-mix.js";

import { CSS4Color } from "./css4-color.js";
import { Current } from "./current.js";
import { System } from "./system.js";

const { either } = Parser;
const { or } = Refinement;

/**
 * @public
 */
export type Color<
  S extends ColorMix.InterpolationSpace = ColorMix.InterpolationSpace,
  H extends ColorMix.HueInterpolationMethod = ColorMix.HueInterpolationMethod,
> = ColorMix<S, H> | CSS4Color | Current | System;

/**
 * @public
 */
export namespace Color {
  export type Canonical = CSS4Color.Canonical;

  export type PartiallyResolved<
    S extends ColorMix.InterpolationSpace = ColorMix.InterpolationSpace,
    H extends ColorMix.HueInterpolationMethod = ColorMix.HueInterpolationMethod,
  > = ColorMix<S, H> | CSS4Color | Current;

  export type JSON<
    S extends ColorMix.InterpolationSpace = ColorMix.InterpolationSpace,
    H extends ColorMix.HueInterpolationMethod = ColorMix.HueInterpolationMethod,
  > = ColorMix.JSON<S, H> | CSS4Color.JSON | Keyword.JSON;

  export const { isCSS4Color } = CSS4Color;
  export const { isCurrent } = Current;
  export const { isSystem } = System;
  export const { isColorMix } = ColorMix;

  /**
   * Resolver for colors, must include the resolution for `currentcolor`.
   */
  export interface Resolver {
    currentColor: CSS4Color.Canonical;
  }

  export interface PartialResolver {}

  export function resolve(resolver: Resolver): (color: Color) => Canonical {
    return (color) =>
      Selective.of(color)
        .if(isSystem, System.resolve)
        .if(isCurrent, () => resolver.currentColor)
        .else((color) => color.resolve(resolver))
        .get();
  }

  export function partiallyResolve<
    S extends ColorMix.InterpolationSpace,
    H extends ColorMix.HueInterpolationMethod,
  >(color: Color<S, H>): PartiallyResolved<S, H> {
    return Selective.of(color)
      .if(isSystem, System.resolve)
      .if(isColorMix, (color) => color.partiallyResolve())
      .else((color) => color)
      .get();
  }

  function toNumber(x: Number | Percentage, base: number): number {
    const y = x.resolve();
    return Number.isNumber(y) ? y.value / base : y.value;
  }

  /**
   * Creates a color in the sRGB color space.
   */
  export function rgb(
    red: Number | Percentage,
    green: Number | Percentage,
    blue: Number | Percentage,
    alpha: Number | Percentage = Number.of(1),
  ): CSS4Color {
    return (
      CSS4Color.of(
        "srgb",
        [toNumber(red, 255), toNumber(green, 255), toNumber(blue, 255)],
        toNumber(alpha, 1),
      )
        // We are sure that the color space id exists, so we should always get a
        // correct color.
        .getUnsafe(
          `Incorrect sRGB color values: ${red}, ${green}, ${blue}, ${alpha}`,
        )
    );
  }

  /**
   * Creates a color based on its CSS string representation.
   */
  export function of(color: string): Result<CSS4Color, Error> {
    return CSS4Color.of(color);
  }

  export const transparent = rgb(
    Percentage.of(0),
    Percentage.of(0),
    Percentage.of(0),
    Percentage.of(0),
  );

  export const current: Current = Keyword.of("currentcolor");
  export const system = Keyword.of;

  /**
   * Composite colors of a graphic element ("foreground") over a backdrop
   * ("background").
   * {@link https://drafts.csswg.org/compositing-1/#simplealphacompositing}
   *
   * @remarks
   * The graphic element (foreground) may have a partially transparent color
   * **and** be part of an HTML element which is itself partially transparent.
   * Both transparencies need to be merged first.
   *
   * @param foreground - The color of the graphic element to combine
   * @param background - The color of the backdrop to combine into
   * @param opacity - The opacity of the graphic element, independently of its color.
   */
  export function composite(
    foreground: Color.Canonical,
    background: Color.Canonical,
    opacity: number,
  ): Color.Canonical {
    const foregroundOpacity = foreground.alpha.value * opacity;

    if (foregroundOpacity === 1) {
      return foreground;
    }

    const backgroundOpacity = background.alpha.value * (1 - foregroundOpacity);

    const [red, green, blue] = [
      [foreground.red, background.red],
      [foreground.green, background.green],
      [foreground.blue, background.blue],
    ].map(
      ([a, b]) => a.value * foregroundOpacity + b.value * backgroundOpacity,
    );

    return rgb(
      Percentage.of(red),
      Percentage.of(green),
      Percentage.of(blue),
      Percentage.of(foregroundOpacity + backgroundOpacity),
    );
  }

  /**
   * {@link https://drafts.csswg.org/css-color/#typedef-color}
   */
  export function parse(
    input: Slice<Token>,
  ): Result<[Slice<Token>, Color], string> {
    return either<Slice<Token>, Color, string>(
      Current.parse,
      System.parse,
      CSS4Color.parse,
      ColorMix.parse(parse),
    )(input);
  }

  export function isTransparent(color: Color): boolean {
    return Selective.of(color)
      .if(isCSS4Color, (color) => color.alpha.value === 0)
      .if(or(isCurrent, isSystem), () => false)
      .else(isTransparentColorMix)
      .get();
  }

  function isTransparentColorMix<
    S extends ColorMix.InterpolationSpace,
    H extends ColorMix.HueInterpolationMethod,
  >(color: ColorMix<S, H>): boolean {
    // All the non-transparent components have 0% presence in the mix
    return color.colors.every(
      (item) =>
        isTransparent(item.value) ||
        item.percentage.map((p) => p.value).getOr(0) === 0,
    );
  }
}
