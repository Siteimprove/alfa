import { Parser } from "@siteimprove/alfa-parser";

import { Angle } from "./angle";
import { Var } from "./color/var";
import { Number } from "./number";
import { Percentage } from "./percentage";
import { Keyword } from "./keyword";

import { Current } from "./color/current";
import { Hex } from "./color/hex";
import { HSL } from "./color/hsl";
import { Named } from "./color/named";
import { RGB } from "./color/rgb";
import { System } from "./color/system";

const { either } = Parser;

export type Color = Hex | Named | HSL | RGB | Current | System | Var;

export namespace Color {
  export type JSON =
    | Hex.JSON
    | Named.JSON
    | HSL.JSON
    | RGB.JSON
    | Keyword.JSON
    | Var.JSON;

  export const current: Current = Keyword.of("currentcolor");

  export function hex(value: number): Hex {
    return Hex.of(value);
  }

  export function hsl<H extends Number | Angle, A extends Number | Percentage>(
    hue: H,
    saturation: Percentage,
    lightness: Percentage,
    alpha: A
  ): HSL<H, A> {
    return HSL.of(hue, saturation, lightness, alpha);
  }

  export function named<C extends Named.Color>(color: C): Named<C> {
    return Named.of(color);
  }

  export function rgb<
    C extends Number | Percentage,
    A extends Number | Percentage
  >(red: C, green: C, blue: C, alpha: A): RGB<C, A> {
    return RGB.of(red, green, blue, alpha);
  }

  export function system(keyword: System.Keyword): System {
    return Keyword.of(keyword);
  }

  /**
   * @see https://drafts.csswg.org/css-color/#typedef-color
   */
  export const parse = either(
    Hex.parse,
    either(
      Named.parse,
      either(
        either(RGB.parse, HSL.parse),
        either(Current.parse, either(System.parse, Var.parse))
      )
    )
  );
}
