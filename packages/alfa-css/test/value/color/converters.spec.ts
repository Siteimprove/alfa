import { test } from "@siteimprove/alfa-test";
import { hslToRgb } from "../../../src/value/color/converters.js";

test("hslToRgb converts HSL color to RGB", (t) => {
  for (const [h, s, l, r, g, b] of [
    [0, 1, 1, 1, 1, 1],
    [0, 1, 0.5, 1, 0, 0],
    [120, 1, 0.5, 0, 1, 0],
    [240, 1, 0.5, 0, 0, 1],
    [60, 1, 0.5, 1, 1, 0],
    [180, 1, 0.5, 0, 1, 1],
    [300, 1, 0.5, 1, 0, 1],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0.5, 0.5, 0.5, 0.5],
    [0, 0, 1, 1, 1, 1],
  ] as const) {
    const source = `hsl(${h}, ${s}%, ${l}%)`;

    t.deepEqual(
      hslToRgb(h, s, l),
      [r, g, b],
      `Failed to convert ${source} to RGB (${r}, ${g}, ${b})`,
    );
  }
});
