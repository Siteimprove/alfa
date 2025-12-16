import { test } from "@siteimprove/alfa-test";

import { Oklab } from "../../../dist/index.js";

import { parserUnsafe } from "../../common/parse.js";

import { Component, rng } from "./common.js";

const parse = parserUnsafe(Oklab.parse);

const oklabMapper = Component.allScaler(-0.4, 0.4, -1, 1, 2);
const oklabRNG = rng(([l, a, b, alpha]) => [
  l,
  oklabMapper(a),
  oklabMapper(b),
  alpha,
]);

const { toJSON, toOklabLightnessJSON, toOklabComponentJSON, toString } =
  Component;

test(
  "parse() accepts number/percentage/none and no alpha",
  (t, rng) => {
    const [lightness, a, b] = rng.rand();

    const actual = `oklab(${toString(lightness)} ${toString(a)} ${toString(b)})`;

    t.deepEqual(
      parse(actual).toJSON(),
      {
        type: "color",
        format: "oklab",
        lightness: toOklabLightnessJSON(lightness),
        a: toOklabComponentJSON(a),
        b: toOklabComponentJSON(b),
        alpha: { type: "number", value: 1 },
      },
      `Failed to parse oklab color ${actual} with seed ${rng.seed} at iteration ${rng.iterations}`,
    );
  },
  { rng: oklabRNG(0.1, 0.5), iterations: 10 },
);

test(
  "parse() accepts number/percentage/none and alpha",
  (t, rng) => {
    const [lightness, a, b, alpha] = rng.rand();

    const actual = `oklab(${toString(lightness)} ${toString(a)} ${toString(b)} / ${toString(alpha)})`;

    t.deepEqual(
      parse(actual).toJSON(),
      {
        type: "color",
        format: "oklab",
        lightness: toOklabLightnessJSON(lightness),
        a: toOklabComponentJSON(a),
        b: toOklabComponentJSON(b),
        alpha: toJSON(alpha),
      },
      `Failed to parse oklab color ${actual} with seed ${rng.seed} at iteration ${rng.iterations}`,
    );
  },
  { rng: oklabRNG(0.1, 0.5), iterations: 10 },
);

test("parse() accepts calculations", (t) => {
  const expected: Oklab.JSON = {
    type: "color",
    format: "oklab",
    lightness: { type: "number", value: 0 },
    a: { type: "number", value: 0.4 },
    b: { type: "number", value: -0.2 },
    alpha: { type: "number", value: 0 },
  };

  for (const [actual] of [
    [parse("oklab(0 .4 -50% / 0)")],
    [parse("oklab(0 100% -0.2 / calc(10 - 5 + 2*3 - 11)")],
    [parse("oklab(calc(20 + 30 - 50) 100% -50% / 0)")],
    [parse("oklab(0 100% calc(-25*2%) / calc(1 + 1 + 2 - 2*2))")],
  ] as const) {
    t.deepEqual(actual.toJSON(), expected);
  }
});

test("#resolve() returns RBG color in percentages", (t) => {
  t.deepEqual(parse("oklab(100 0 0)").resolve().toJSON(), {
    type: "color",
    format: "rgb",
    red: { type: "percentage", value: 1 },
    green: { type: "percentage", value: 1 },
    blue: { type: "percentage", value: 1 },
    alpha: { type: "percentage", value: 1 },
  });
});
