import type { Vector } from "@siteimprove/alfa-math";
import { test } from "@siteimprove/alfa-test";

import {
  type ColorSpace,
  convertRGB,
  hslToRgb,
  hwbToRgb,
  type RGB,
} from "../../../src/value/color/converters.js";

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

test("convertRGB linearize RGB colors", (t) => {
  const cases: Array<[ColorSpace, Vector, Vector]> = [
    ["sRGB", [0, 0.1, 0.2], [0, 0.010022825574869039, 0.033104766570885055]],
    [
      "sRGB",
      [0.3, 0.4, 0.5],
      [0.07323895587840543, 0.13286832155381798, 0.21404114048223255],
    ],
    [
      "sRGB",
      [0.6, 0.7, 0.8],
      [0.31854677812509186, 0.44798841244188325, 0.6038273388553378],
    ],
    ["sRGB", [0.9, 1.0, 0.0], [0.7874122893956172, 1.0, 0.0]],
  ];

  for (const [space, RGB, linearRGB] of cases) {
    const source = { space, linear: false, components: RGB };

    t.deepEqual(
      convertRGB(source, { space, linear: true }),
      { space, linear: true, components: linearRGB },
      `Failed to linearize sRGB color rgb(${RGB.join(", ")})`,
    );
  }
});

test("convertRGB de-linearize RGB colors", (t) => {
  const cases: Array<[ColorSpace, Vector, Vector]> = [
    ["sRGB", [0, 0.1, 0.2], [0, 0.3491902126282938, 0.48452920448170694]],
    [
      "sRGB",
      [0.3, 0.4, 0.5],
      [0.5838314900602575, 0.6651850846308363, 0.7353569830524495],
    ],
    [
      "sRGB",
      [0.6, 0.7, 0.8],
      [0.7977377330312598, 0.85430583154494, 0.9063317533440594],
    ],
    ["sRGB", [0.9, 1.0, 0.0], [0.9546871718858662, 0.9999999999999999, 0.0]],
  ];

  for (const [space, linearRGB, sRGB] of cases) {
    const source = { space, linear: true, components: linearRGB };

    t.deepEqual(
      convertRGB(source, { space, linear: false }),
      { space, linear: false, components: sRGB },
      `Failed to de-linearize sRGB-linear color rgb(${linearRGB.join(", ")})`,
    );
  }
});
