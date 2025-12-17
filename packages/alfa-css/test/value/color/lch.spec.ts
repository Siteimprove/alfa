import { test } from "@siteimprove/alfa-test";

import { LCH } from "../../../dist/index.js";

import { parserUnsafe } from "../../common/parse.js";

import { Component, rng } from "./common.js";

const parse = parserUnsafe(LCH.parse);

const lchChromaMapper = Component.numberScaler(0, 150);
const lchLightnessMapper = Component.numberScaler(0, 100);
const lchRNG = rng(([l, c, h, a]) => [
  lchLightnessMapper(l),
  lchChromaMapper(c),
  h,
  a,
]);

const {
  toHueJSON,
  toJSON,
  toLCHChromaJSON,
  toLCHLightnessJSON,
  toHueString,
  toString,
} = Component;

test(
  "parse() accepts number/percentage/none and no alpha",
  (t, rng) => {
    const [lightness, chroma, hue] = rng.rand();

    const actual = `lch(${toString(lightness)} ${toString(chroma)} ${toHueString(hue)})`;

    t.deepEqual(
      parse(actual).toJSON(),
      {
        type: "color",
        format: "lch",
        lightness: toLCHLightnessJSON(lightness),
        chroma: toLCHChromaJSON(chroma),
        hue: toHueJSON(hue),
        alpha: { type: "number", value: 1 },
      },
      `Failed to parse lch color ${actual} with seed ${rng.seed} at iteration ${rng.iterations}`,
    );
  },
  { rng: lchRNG(0.1, 0.5), iterations: 10 },
);

test(
  "parse() accepts number/percentage/none and alpha",
  (t, rng) => {
    const [lightness, chroma, hue, alpha] = rng.rand();

    const actual = `lch(${toString(lightness)} ${toString(chroma)} ${toHueString(hue)} / ${toString(alpha)})`;

    t.deepEqual(
      parse(actual).toJSON(),
      {
        type: "color",
        format: "lch",
        lightness: toLCHLightnessJSON(lightness),
        chroma: toLCHChromaJSON(chroma),
        hue: toHueJSON(hue),
        alpha: toJSON(alpha),
      },
      `Failed to parse lch color ${actual} with seed ${rng.seed} at iteration ${rng.iterations}`,
    );
  },
  { rng: lchRNG(0.1, 0.5), iterations: 10 },
);

test("parse() accepts calculations", (t) => {
  const expected: LCH.JSON = {
    type: "color",
    format: "lch",
    lightness: { type: "number", value: 0 },
    chroma: { type: "number", value: 75 },
    hue: { type: "angle", value: 270, unit: "deg" },
    alpha: { type: "number", value: 0 },
  };

  for (const [actual] of [
    [parse("lch(0 75 270deg / 0)")],
    [parse("lch(0 calc(50 + 25) .75turn / calc(10 - 5 + 2*3 - 11)")],
    [parse("lch(calc(20 + 30 - 50) 50% 270deg / 0)")],
    [parse("lch(0 50% calc(90deg + (90deg * 2)) / calc(1 + 1 + 2 - 2*2))")],
  ] as const) {
    t.deepEqual(actual.toJSON(), expected);
  }
});

test("#resolve() returns RBG color in percentages", (t) => {
  t.deepEqual(parse("lch(100 0 0)").resolve().toJSON(), {
    type: "color",
    format: "rgb",
    red: { type: "percentage", value: 1 },
    green: { type: "percentage", value: 1 },
    blue: { type: "percentage", value: 1 },
    alpha: { type: "percentage", value: 1 },
  });
});
