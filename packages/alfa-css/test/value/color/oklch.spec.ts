import { test } from "@siteimprove/alfa-test";

import { OkLCH } from "../../../dist/index.js";

import { parserUnsafe } from "../../common/parse.js";

import { Component, rng } from "./common.js";

const parse = parserUnsafe(OkLCH.parse);

const oklchMapper = Component.numberScaler(0, 0.4);
const oklchRNG = rng(([l, c, h, a]) => [l, oklchMapper(c), h, a]);

const {
  toHueJSON,
  toJSON,
  toOkLCHChromaJSON,
  toOkLCHLightnessJSON,
  toHueString,
  toString,
} = Component;

test(
  "parse() accepts number/percentage/none and no alpha",
  (t, rng) => {
    const [lightness, chroma, hue] = rng.rand();

    const actual = `oklch(${toString(lightness)} ${toString(chroma)} ${toHueString(hue)})`;

    t.deepEqual(
      parse(actual).toJSON(),
      {
        type: "color",
        format: "oklch",
        lightness: toOkLCHLightnessJSON(lightness),
        chroma: toOkLCHChromaJSON(chroma),
        hue: toHueJSON(hue),
        alpha: { type: "number", value: 1 },
      },
      `Failed to parse oklch color ${actual} with seed ${rng.seed} at iteration ${rng.iterations}`,
    );
  },
  { rng: oklchRNG(0.1, 0.5), iterations: 10 },
);

test(
  "parse() accepts number/percentage/none and alpha",
  (t, rng) => {
    const [lightness, chroma, hue, alpha] = rng.rand();

    const actual = `oklch(${toString(lightness)} ${toString(chroma)} ${toHueString(hue)} / ${toString(alpha)})`;

    t.deepEqual(
      parse(actual).toJSON(),
      {
        type: "color",
        format: "oklch",
        lightness: toOkLCHLightnessJSON(lightness),
        chroma: toOkLCHChromaJSON(chroma),
        hue: toHueJSON(hue),
        alpha: toJSON(alpha),
      },
      `Failed to parse oklch color ${actual} with seed ${rng.seed} at iteration ${rng.iterations}`,
    );
  },
  { rng: oklchRNG(0.1, 0.5), iterations: 10 },
);

test("parse() accepts calculations", (t) => {
  const expected: OkLCH.JSON = {
    type: "color",
    format: "oklch",
    lightness: { type: "number", value: 0 },
    chroma: { type: "number", value: 0.3 },
    hue: { type: "angle", value: 270, unit: "deg" },
    alpha: { type: "number", value: 0 },
  };

  for (const [actual] of [
    [parse("oklch(0 .3 270deg / 0)")],
    [parse("oklch(0 calc(.2 + .1) .75turn / calc(10 - 5 + 2*3 - 11)")],
    [parse("oklch(calc(20 + 30 - 50) 75% 270deg / 0)")],
    [parse("oklch(0 75% calc(90deg + (90deg * 2)) / calc(1 + 1 + 2 - 2*2))")],
  ] as const) {
    t.deepEqual(actual.toJSON(), expected);
  }
});

test("#resolve() returns RBG color in percentages", (t) => {
  t.deepEqual(parse("oklch(100 0 0)").resolve().toJSON(), {
    type: "color",
    format: "rgb",
    red: { type: "percentage", value: 1 },
    green: { type: "percentage", value: 1 },
    blue: { type: "percentage", value: 1 },
    alpha: { type: "percentage", value: 1 },
  });
});
