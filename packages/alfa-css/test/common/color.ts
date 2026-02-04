import { Real } from "@siteimprove/alfa-math";
import type { CSS4Color } from "../../dist/value/color/css4-color.js";

/** @internal */
export function color(
  red: number,
  green: number,
  blue: number,
  alpha: number = 1,
): CSS4Color.JSON {
  const [r, g, b, a] = [red, green, blue, alpha].map((v) => Real.round(v, 5));

  return {
    type: "color",
    space: "srgb",
    coordinates: [r, g, b],
    sRGB: [
      { type: "percentage", value: r },
      { type: "percentage", value: g },
      { type: "percentage", value: b },
    ],
    alpha: { type: "percentage", value: a },
  };
}
