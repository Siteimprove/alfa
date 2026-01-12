import type { CSS4Color } from "../../dist/value/color/css4-color.js";

export function color(r: number, g: number, b: number): CSS4Color.JSON {
  return {
    type: "color",
    space: "srgb",
    coordinates: [r, g, b],
    sRGB: [
      { type: "percentage", value: r },
      { type: "percentage", value: g },
      { type: "percentage", value: b },
    ],
    alpha: { type: "number", value: 1 },
  };
}
