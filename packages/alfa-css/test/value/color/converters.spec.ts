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
    [
      "prophoto-rgb",
      [
        0, 0.015848931924611134, 0.05518918645844859, 0.11450336728854528,
        0.192179909437029, 0.2871745887492587, 0.3987238835693844,
        0.5262310526550318, 0.669209313658415, 0.8272495069561094, 1,
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
    [
      "prophoto-rgb",
      [
        0, 0.2782559402207124, 0.4089623530229582, 0.5122851987684007,
        0.6010660762800317, 0.6803950000871885, 0.7529232265121797,
        0.82024455397501, 0.8834075444455188, 0.9431465314595465, 1,
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
  // Note that each component actually depends on all 3, so the regularity in
  // the tests cases is probably bad for entropy. This is likely good enough
  // given that we only test some linear transformations, so the chances of
  // only getting the right result on a few points are low, especially since
  // the 3 input vectors form a basis of the space.
  const cases: Array<[ColorSpace, Vector, Vector, Vector]> = [
    [
      "sRGB",
      [0.1, 0.2, 0.3],
      [0.11775380312856379, 0.1966805801149038, 0.28934372978937967],
      [0.16112915427762847, 0.192979756801214, 0.28485899039011053],
    ],
    [
      "sRGB",
      [0.4, 0.5, 0.6],
      [0.4177538031285638, 0.49668058011490374, 0.5893437297893798],
      [0.4611291542776286, 0.4929797568012139, 0.5848589903901106],
    ],
    [
      "sRGB",
      [0.7, 0.8, 0.9],
      [0.7177538031285637, 0.7966805801149037, 0.8893437297893797],
      [0.7611291542776287, 0.792979756801214, 0.8848589903901106],
    ],
    [
      "display-p3",
      [0.07750598237194398, 0.20420569547096884, 0.3117911154731301],
      [0.1, 0.2, 0.3],
      [0.15226957756246257, 0.1947727434704007, 0.295179036479282],
    ],
    [
      "display-p3",
      [0.3775059823719439, 0.5042056954709688, 0.6117911154731301],
      [0.4, 0.5, 0.6],
      [0.4522695775624627, 0.4947727434704007, 0.5951790364792819],
    ],
    [
      "display-p3",
      [0.6775059823719438, 0.804205695470969, 0.9117911154731301],
      [0.7, 0.8, 0.9],
      [0.7522695775624628, 0.7947727434704007, 0.895179036479282],
    ],
    [
      "prophoto-rgb",
      [-0.03411259090998592, 0.2225908922075996, 0.3170384359705871],
      [0.011462040106876195, 0.21406982574325997, 0.30420209220560634],
      [0.1, 0.2, 0.3],
    ],
    [
      "prophoto-rgb",
      [0.26588740909001385, 0.5225908922075997, 0.617038435970587],
      [0.31146204010687606, 0.5140698257432599, 0.6042020922056064],
      [0.4, 0.5, 0.6],
    ],
    [
      "prophoto-rgb",
      [0.5658874090900132, 0.8225908922075996, 0.9170384359705872],
      [0.6114620401068755, 0.8140698257432598, 0.9042020922056063],
      [0.7, 0.8, 0.9],
    ],
  ];

  for (const [source, sRGB, displayP3, prophoto] of cases) {
    const values = {
      sRGB,
      "display-p3": displayP3,
      "prophoto-rgb": prophoto,
    } as const;

    const sourceColor = {
      space: source,
      linear: true,
      components: values[source],
    };

    for (const dest of Object.keys(values) as ColorSpace[]) {
      t.deepEqual(
        convertRGB(sourceColor, { space: dest, linear: true }),
        { space: dest, linear: true, components: values[dest] },
        `Failed to convert ${source}(${values[source]}) linear to ${dest} linear.`,
      );
    }
  }
});
