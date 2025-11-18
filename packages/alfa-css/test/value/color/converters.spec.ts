import type { Vector } from "@siteimprove/alfa-math";
import { test } from "@siteimprove/alfa-test";

import {
  type ColorSpace,
  convertRGB,
  hslToRgb,
  hwbToRgb,
} from "../../../src/value/color/converters.js";

test("hslToRgb() converts HSL color to RGB", (t) => {
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

test("hwbToRgb() converts HWB color to RGB", (t) => {
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

test("convertRGB() linearize RGB colors", (t) => {
  // Since convertRGB doesn't check the number of components, we can test a
  // bunch of values in one go when we don't use the matrices…
  const cases: Array<[ColorSpace, Vector]> = [
    [
      "sRGB",
      [
        0, 0.010022825574869039, 0.033104766570885055, 0.07323895587840543,
        0.13286832155381798, 0.21404114048223255, 0.31854677812509186,
        0.44798841244188325, 0.6038273388553378, 0.7874122893956172, 1.0,
      ],
    ],
    [
      "display-p3",
      [
        0, 0.010022825574869039, 0.033104766570885055, 0.07323895587840543,
        0.13286832155381798, 0.21404114048223255, 0.31854677812509186,
        0.44798841244188325, 0.6038273388553378, 0.7874122893956172, 1.0,
      ],
    ],
  ];

  for (const [space, expected] of cases) {
    const source = {
      space,
      linear: false,
      components: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    };

    t.deepEqual(
      convertRGB(source, { space, linear: true }),
      { space, linear: true, components: expected },
      `Failed to linearize RGB color ${space}.`,
    );
  }
});

test("convertRGB() de-linearize RGB colors", (t) => {
  // Since convertRGB doesn't check the number of components, we can test a
  // bunch of values in one go when we don't use the matrices…
  const cases: Array<[ColorSpace, Vector]> = [
    [
      "sRGB",
      [
        0, 0.3491902126282938, 0.48452920448170694, 0.5838314900602575,
        0.6651850846308363, 0.7353569830524495, 0.7977377330312598,
        0.85430583154494, 0.9063317533440594, 0.9546871718858662,
        0.9999999999999999,
      ],
    ],
    [
      "display-p3",
      [
        0, 0.3491902126282938, 0.48452920448170694, 0.5838314900602575,
        0.6651850846308363, 0.7353569830524495, 0.7977377330312598,
        0.85430583154494, 0.9063317533440594, 0.9546871718858662,
        0.9999999999999999,
      ],
    ],
  ];

  for (const [space, expected] of cases) {
    const source = {
      space,
      linear: true,
      components: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    };

    t.deepEqual(
      convertRGB(source, { space, linear: false }),
      { space, linear: false, components: expected },
      `Failed to de-linearize RGB-linear color ${space}-linear.`,
    );
  }
});

test("convertRGB() converts between RGB color spaces", (t) => {
  // Since (de-)linearization is tested separately, we only convert between
  // linear colors.
  // Since we need to use the matrices, we can only test colors with 3 components.
  const cases: Array<[ColorSpace, ColorSpace, Vector, Vector]> = [
    [
      "sRGB",
      "display-p3",
      [0.1, 0.2, 0.3],
      [0.11775380312856379, 0.1966805801149038, 0.28934372978937967],
    ],
    [
      "sRGB",
      "display-p3",
      [0.4, 0.5, 0.6],
      [0.4177538031285638, 0.49668058011490374, 0.5893437297893798],
    ],
    [
      "sRGB",
      "display-p3",
      [0.7, 0.8, 0.9],
      [0.7177538031285637, 0.7966805801149037, 0.8893437297893797],
    ],
    [
      "display-p3",
      "sRGB",
      [0.1, 0.2, 0.3],
      [0.07750598237194398, 0.20420569547096884, 0.3117911154731301],
    ],
    [
      "display-p3",
      "sRGB",
      [0.4, 0.5, 0.6],
      [0.3775059823719439, 0.5042056954709688, 0.6117911154731301],
    ],
    [
      "display-p3",
      "sRGB",
      [0.7, 0.8, 0.9],
      [0.6775059823719438, 0.804205695470969, 0.9117911154731301],
    ],
  ];

  for (const [src, dest, source, destination] of cases) {
    const sourceColor = {
      space: src,
      linear: true,
      components: source,
    };

    t.deepEqual(
      convertRGB(sourceColor, { space: dest, linear: true }),
      { space: dest, linear: true, components: destination },
      `Failed to convert ${src}(${source}) linear to ${dest} linear.`,
    );
  }
});
