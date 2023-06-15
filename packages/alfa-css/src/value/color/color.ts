import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../syntax";

import { Keyword } from "../keyword";
import { Angle, Number, Percentage } from "../numeric";

import { Current } from "./current";
import { Hex } from "./hex";
import { HSL } from "./hsl";
import { Named } from "./named";
import { RGB } from "./rgb";
import { System } from "./system";

const { either } = Parser;

/**
 * @public
 */
export type Color = Hex | Named | HSL | RGB | Current | System;

/**
 * @public
 */
export namespace Color {
  export type JSON = Hex.JSON | Named.JSON | HSL.JSON | RGB.JSON | Keyword.JSON;

  export const current: Current = Keyword.of("currentcolor");

  export function hex(value: number): Hex {
    return Hex.of(value);
  }

  export function hsl<
    H extends Number.Fixed | Angle.Fixed,
    A extends Number.Fixed | Percentage.Fixed
  >(
    hue: H,
    saturation: Percentage.Fixed,
    lightness: Percentage.Fixed,
    alpha: A
  ): HSL<H, A> {
    return HSL.of(hue, saturation, lightness, alpha);
  }

  export function named<C extends Named.Color>(color: C): Named<C> {
    return Named.of(color);
  }

  export function rgb<
    C extends Number.Fixed | Percentage.Fixed,
    A extends Number.Fixed | Percentage.Fixed
  >(red: C, green: C, blue: C, alpha: A): RGB<C, A> {
    return RGB.of(red, green, blue, alpha);
  }

  export function system(keyword: System.Keyword): System {
    return Keyword.of(keyword);
  }

  /**
   * {@link https://drafts.csswg.org/css-color/#typedef-color}
   */
  export const parse: Parser<Slice<Token>, Color, string> = either(
    Hex.parse,
    either(
      Named.parse,
      either(either(RGB.parse, HSL.parse), either(Current.parse, System.parse))
    )
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
