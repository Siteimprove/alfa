import { test } from "@siteimprove/alfa-test";

import { HWB } from "../../../dist/index.js";

import { parser, parserUnsafe } from "../../common/parse.js";

import { Component, rng } from "./common.js";

const parse = parserUnsafe(HWB.parse);
const parseErr = parser(HWB.parse);

const {
  toBlacknessJSON,
  toBlacknessString,
  toHueJSON,
  toHueString,
  toJSON,
  toString,
  toWhitenessJSON,
  toWhitenessString,
} = Component;

test(
  "parse() accepts modern syntax with number/percentage/none and no alpha",
  (t, rng) => {
    const [hue, whiteness, blackness] = rng.rand();

    const actual = `hwb(${toHueString(hue)} ${toWhitenessString(whiteness)} ${toBlacknessString(blackness)})`;

    t.deepEqual(
      parse(actual).toJSON(),
      {
        type: "color",
        format: "hwb",
        hue: toHueJSON(hue),
        whiteness: toWhitenessJSON(whiteness),
        blackness: toBlacknessJSON(blackness),
        alpha: { type: "number", value: 1 },
      },
      `Failed to parse hwb color ${actual} with seed ${rng.seed} at iteration ${rng.iterations}`,
    );
  },
  { rng: rng(0.1, 0.5), iterations: 10 },
);

test(
  "parse() accepts modern syntax with number/percentage/none and alpha",
  (t, rng) => {
    const [hue, whiteness, blackness, alpha] = rng.rand();

    const actual = `hwb(${toHueString(hue)} ${toWhitenessString(whiteness)} ${toBlacknessString(blackness)} / ${toString(alpha)})`;

    t.deepEqual(
      parse(actual).toJSON(),
      {
        type: "color",
        format: "hwb",
        hue: toHueJSON(hue),
        whiteness: toWhitenessJSON(whiteness),
        blackness: toBlacknessJSON(blackness),
        alpha: toJSON(alpha),
      },
      `Failed to parse hwb color ${actual} with seed ${rng.seed} at iteration ${rng.iterations}`,
    );
  },
  { rng: rng(0.1, 0.5), iterations: 10 },
);

test("parse() accepts calculations", (t) => {
  const expected = (type: "number" | "angle"): HWB.JSON => ({
    type: "color",
    format: "hwb",
    hue:
      type === "angle"
        ? { type: "angle", value: 0, unit: "deg" }
        : { type: "number", value: 0 },
    whiteness: { type: "percentage", value: 1 },
    blackness: { type: "percentage", value: 0 },
    alpha: { type: "number", value: 0 },
  });

  for (const [actual, type] of [
    [parse("hwb(0 100% 0% / 0)"), "number"],
    [parse("hwb(0 100% 0% / calc(10 - 5 + 2*3 - 11)"), "number"],
    [parse("hwb(calc(3deg + 3deg - 6deg) 100% 0% / 0)"), "angle"],
    [parse("hwb(0 100% calc(0*2%) / calc(1 + 1 + 2 - 2*2))"), "number"],
  ] as const) {
    t.deepEqual(actual.toJSON(), expected(type));
  }
});

test("#resolve() returns RBG color in percentages", (t) => {
  t.deepEqual(parse("hwb(0 100% 100%)").resolve().toJSON(), {
    type: "color",
    format: "rgb",
    red: { type: "percentage", value: 0.5 },
    green: { type: "percentage", value: 0.5 },
    blue: { type: "percentage", value: 0.5 },
    alpha: { type: "percentage", value: 1 },
  });
});
