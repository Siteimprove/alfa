/*
 * This file defines the final `Color` type, grouping all the individual
 * formats.
 * For the `color()` function specifying colors by color space, see
 * `./color-function.ts`.
 */
import { Parser } from "@siteimprove/alfa-parser";
import type { Slice } from "@siteimprove/alfa-slice";

import type { Parser as CSSParser, Token } from "../../syntax/index.js";

import { Keyword } from "../textual/keyword.js";

import { ColorFunction } from "./color-function.js";
import { Current } from "./current.js";
import { Hex } from "./hex.js";
import { HSL } from "./hsl.js";
import { HWB } from "./hwb.js";
import { Lab } from "./lab.js";
import { Named } from "./named.js";
import { RGB } from "./rgb.js";
import { System } from "./system.js";

const { either } = Parser;

/**
 * @public
 */
export type Color =
  | ColorFunction
  | Hex
  | Lab
  | Named
  | HSL
  | HWB
  | RGB
  | Current
  | System;

/**
 * @public
 */
export namespace Color {
  export type Canonical = Current | System | RGB.Canonical;

  export type JSON =
    | ColorFunction.JSON
    | Hex.JSON
    | Lab.JSON
    | Named.JSON
    | HSL.JSON
    | HWB.JSON
    | RGB.JSON
    | Keyword.JSON;

  export const current: Current = Keyword.of("currentcolor");

  export const hex = Hex.of;

  export const hsl = HSL.of;

  export const hwb = HWB.of;

  export const lab = Lab.of;

  export const named = Named.of;

  export const rgb = RGB.of;

  export const system = Keyword.of;

  /**
   * {@link https://drafts.csswg.org/css-color/#typedef-color}
   */
  export const parse: CSSParser<Color> = either<Slice<Token>, Color, string>(
    ColorFunction.parse,
    Hex.parse,
    Lab.parse,
    Named.parse,
    RGB.parse,
    HSL.parse,
    HWB.parse,
    Current.parse,
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
