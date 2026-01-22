import { Parser } from "@siteimprove/alfa-parser";
import type { Result } from "@siteimprove/alfa-result";
import { Selective } from "@siteimprove/alfa-selective";
import type { Slice } from "@siteimprove/alfa-slice";

import type { Parser as CSSParser, Token } from "../../syntax/index.js";
import { Number, Percentage } from "../numeric/index.js";

import { Keyword } from "../textual/keyword.js";

import { CSS4Color } from "./css4-color.js";
import { Current } from "./current.js";
import { System } from "./system.js";

const { either } = Parser;

/**
 * @public
 */
export type Color = CSS4Color | Current | System;

/**
 * @public
 */
export namespace Color {
  export type Canonical = Current | System | CSS4Color.Canonical; // TODO: only CSS4Color

  export type JSON = CSS4Color.JSON | Keyword.JSON;

  /**
   * Resolver for color-mix, must include the resolution for `currentcolor`.
   */
  export interface Resolver {
    currentColor: CSS4Color.Canonical;
  }

  // TODO: return Canonical
  export function resolve(
    resolver: Resolver,
  ): (color: Color) => CSS4Color.Canonical {
    return (color) =>
      Selective.of(color)
        .if(System.isSystem, System.resolve)
        .if(Current.isCurrent, () => resolver.currentColor)
        .else((color) => color.resolve())
        .get();
  }

  export function partiallyResolve(color: Color): Color {
    return Selective.of(color)
      .if(System.isSystem, System.resolve)
      .if(Current.isCurrent, () => color)
      .else((color) => color) // TODO handle mixes
      .get();
  }

  function toNumber(x: Number | Percentage, base: number): number {
    const y = x.resolve();
    return Number.isNumber(y) ? y.value / base : y.value;
  }

  export const current: Current = Keyword.of("currentcolor");

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

  export const system = Keyword.of;

  /**
   * {@link https://drafts.csswg.org/css-color/#typedef-color}
   */
  export const parse: CSSParser<Color> = either<Slice<Token>, Color, string>(
    Current.parse,
    System.parse,
    CSS4Color.parse,
  );

  export function isTransparent(color: Color): boolean {
    switch (color.type) {
      case "keyword":
        return false;

      case "color":
        return color.alpha.value === 0;
    }
  }
}
