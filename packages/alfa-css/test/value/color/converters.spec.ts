import { test } from "@siteimprove/alfa-test";
import { hslToRgb, hwbToRgb } from "../../../src/value/color/converters.js";

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
    const source = `hsl(${h}, ${s * 100}%, ${l * 100}%)`;

    t.deepEqual(
      hslToRgb(h, s, l),
      [r, g, b],
      `Failed to convert ${source} to RGB (${r}, ${g}, ${b})`,
    );
  }
});

test("hwbToRgb converts HWB color to RGB", (t) => {
  for (const [h, w, b, r, g, bl] of [
    [0, 0, 0, 1, 0, 0],
    [120, 0, 0, 0, 1, 0],
    [240, 0, 0, 0, 0, 1],
    [60, 0, 0, 1, 1, 0],
    [180, 0, 0, 0, 1, 1],
    [300, 0, 0, 1, 0, 1],
    [0, 1, 0, 1, 1, 1],
    [0, 0.5, 0.5, 0.5, 0.5, 0.5],
    [0, 0.2, 0.3, 0.7, 0.2, 0.2],
  ] as const) {
    const source = `hwb(${h}, ${w * 100}%, ${b * 100}%)`;

    t.deepEqual(
      hwbToRgb(h, w, b),
      [r, g, bl],
      `Failed to convert ${source} to RGB (${r}, ${g}, ${bl})`,
    );
  }
});
