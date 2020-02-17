import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";

import { Angle } from "./angle";
import { Number } from "./number";
import { Percentage } from "./percentage";

import { Hex } from "./color/hex";
import { HSL } from "./color/hsl";
import { Named } from "./color/named";
import { RGB } from "./color/rgb";

const { either } = Parser;

export interface Color extends Equatable, Serializable {
  readonly type: "color";
  readonly format: string;
  readonly red: Number | Percentage;
  readonly green: Number | Percentage;
  readonly blue: Number | Percentage;
  readonly alpha: Number | Percentage;
}

export namespace Color {
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

  export function named<N extends Named.Name>(name: N): Named<N> {
    return Named.of(name);
  }

  export function rgb<
    C extends Number | Percentage,
    A extends Number | Percentage
  >(red: C, green: C, blue: C, alpha: A): RGB<C, A> {
    return RGB.of(red, green, blue, alpha);
  }

  export const parse = either(
    Hex.parse,
    either(Named.parse, either(RGB.parse, HSL.parse))
  );
}
