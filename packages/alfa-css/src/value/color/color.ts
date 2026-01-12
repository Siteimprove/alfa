/*
 * This file defines the final `Color` type, grouping all the individual
 * formats.
 * For the `color()` function specifying colors by color space, see
 * `./color-function.ts`.
 */
import { Parser } from "@siteimprove/alfa-parser";
import type { Slice } from "@siteimprove/alfa-slice";

import type { Parser as CSSParser, Token } from "../../syntax/index.js";
import { Number, Percentage } from "../numeric/index.js";

import { Keyword } from "../textual/keyword.js";

import { ColorFunction } from "./color-function.js";
import { CSS4Color } from "./css4-color.js";
import { Current } from "./current.js";
import { Hex } from "./hex.js";
import { HSL } from "./hsl.js";
import { HWB } from "./hwb.js";
import { Lab } from "./lab.js";
import { LCH } from "./lch.js";
import { Named } from "./named.js";
import { Oklab } from "./oklab.js";
import { OkLCH } from "./oklch.js";
import { RGB } from "./rgb.js";
import { System } from "./system.js";

const { either } = Parser;

/**
 * @public
 */
export type Color =
  // | ColorFunction
  | CSS4Color
  | Current
  // | Hex
  // | HSL
  // | HWB
  // | Lab
  // | LCH
  // | Named
  // | Oklab
  // | OkLCH
  // | RGB
  | System;

/**
 * @public
 */
export namespace Color {
  export type Canonical = Current | System | CSS4Color.Canonical;

  export type JSON =
    // | ColorFunction.JSON
    // | Hex.JSON
    // | HSL.JSON
    // | HWB.JSON
    // | Lab.JSON
    // | LCH.JSON
    // | Named.JSON
    // | Oklab.JSON
    // | OkLCH.JSON
    // | RGB.JSON
    CSS4Color.JSON | Keyword.JSON;

  function toNumber(x: Number | Percentage, base: number): number {
    const y = x.resolve();
    return Number.isNumber(y) ? y.value / base : y.value;
  }

  export const current: Current = Keyword.of("currentcolor");

  // export const color = CSS4Color.of;

  // export const hex = Hex.of;
  //
  // export const hsl = HSL.of;
  //
  // export const hwb = HWB.of;
  //
  // export const lab = Lab.of;
  //
  // export const lch = LCH.of;
  //
  // export const named = Named.of;
  //
  // export const oklab = Oklab.of;
  //
  // export const oklch = OkLCH.of;
  //
  // export const rgb = RGB.of;

  export function rgb(
    red: Number | Percentage,
    green: Number | Percentage,
    blue: Number | Percentage,
    alpha: Number | Percentage = Number.of(1),
  ): CSS4Color {
    return CSS4Color.of(
      "srgb",
      [toNumber(red, 255), toNumber(green, 255), toNumber(blue, 255)],
      toNumber(alpha, 1),
    );
  }

  export const system = Keyword.of;

  /**
   * {@link https://drafts.csswg.org/css-color/#typedef-color}
   *
   * @privateRemarks
   * We could probably get a small performance boost by pre-scanning the first
   * token and select the correct parser, especially for the many functional
   * notations. Given that this should only run in a context where a color is
   * expected, the gain might be minimal.
   */
  export const parse: CSSParser<Color> = either<Slice<Token>, Color, string>(
    // ColorFunction.parse,
    CSS4Color.parse,
    Current.parse,
    // Hex.parse,
    // HSL.parse,
    // HWB.parse,
    // Lab.parse,
    // LCH.parse,
    // Named.parse,
    // Oklab.parse,
    // OkLCH.parse,
    // RGB.parse,
    System.parse,
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
