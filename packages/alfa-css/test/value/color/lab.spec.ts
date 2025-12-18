import { test } from "@siteimprove/alfa-test";

import { Lab } from "../../../dist/index.js";

import { parserUnsafe } from "../../common/parse.js";

import { Component, rng } from "./common.js";

const parse = parserUnsafe(Lab.parse);

const labMapper = Component.allScaler(-125, 125, -1, 1, 2);
const labLightnessMapper = Component.numberScaler(0, 100);
const labRNG = rng(([l, a, b, alpha]) => [
  labLightnessMapper(l),
  labMapper(a),
  labMapper(b),
  alpha,
]);

const { toJSON, toLabComponentJSON, toLabLightnessJSON, toString } = Component;

test(
  "parse() accepts number/percentage/none and no alpha",
  (t, rng) => {
    const [lightness, a, b] = rng.rand();

    const actual = `lab(${toString(lightness)} ${toString(a)} ${toString(b)})`;

    t.deepEqual(
      parse(actual).toJSON(),
      {
        type: "color",
        format: "lab",
        lightness: toLabLightnessJSON(lightness),
        a: toLabComponentJSON(a),
        b: toLabComponentJSON(b),
        alpha: { type: "number", value: 1 },
      },
      `Failed to parse lab color ${actual} with seed ${rng.seed} at iteration ${rng.iterations}`,
    );
  },
  { rng: labRNG(0.1, 0.5), iterations: 10 },
);

test(
  "parse() accepts number/percentage/none and alpha",
  (t, rng) => {
    const [lightness, a, b, alpha] = rng.rand();

    const actual = `lab(${toString(lightness)} ${toString(a)} ${toString(b)} / ${toString(alpha)})`;

    t.deepEqual(
      parse(actual).toJSON(),
      {
        type: "color",
        format: "lab",
        lightness: toLabLightnessJSON(lightness),
        a: toLabComponentJSON(a),
        b: toLabComponentJSON(b),
        alpha: toJSON(alpha),
      },
      `Failed to parse lab color ${actual} with seed ${rng.seed} at iteration ${rng.iterations}`,
    );
  },
  { rng: labRNG(0.1, 0.5), iterations: 10 },
);

test("parse() accepts calculations", (t) => {
  const expected: Lab.JSON = {
    type: "color",
    format: "lab",
    lightness: { type: "number", value: 0 },
    a: { type: "number", value: 125 },
    b: { type: "number", value: -62.5 },
    alpha: { type: "number", value: 0 },
  };

  for (const [actual] of [
    [parse("lab(0 125 -50% / 0)")],
    [parse("lab(0 100% -62.5 / calc(10 - 5 + 2*3 - 11)")],
    [parse("lab(calc(20 + 30 - 50) 100% -50% / 0)")],
    [parse("lab(0 100% calc(-25*2%) / calc(1 + 1 + 2 - 2*2))")],
  ] as const) {
    t.deepEqual(actual.toJSON(), expected);
  }
});

test("#resolve() returns RBG color in percentages", (t) => {
  t.deepEqual(parse("lab(100 0 0)").resolve().toJSON(), {
    type: "color",
    format: "rgb",
    red: { type: "percentage", value: 1 },
    green: { type: "percentage", value: 1 },
    blue: { type: "percentage", value: 1 },
    alpha: { type: "percentage", value: 1 },
  });
});
