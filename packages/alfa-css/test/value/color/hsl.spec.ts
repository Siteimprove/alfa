import { test } from "@siteimprove/alfa-test";

import { HSL } from "../../../dist/index.js";

import { parser, parserUnsafe } from "../../common/parse.js";
import { Component, rng } from "./common.js";

const {
  toHueJSON,
  toHueString,
  toJSON,
  toLightnessJSON,
  toLightnessString,
  toSaturationJSON,
  toSaturationString,
  toString,
} = Component;

const parse = parserUnsafe(HSL.parse);
const parseErr = parser(HSL.parse);

test(
  "parse() accepts legacy syntax with percentages and no alpha",
  (t, rng) => {
    for (const hsl of ["hsl", "hsla"]) {
      const [hue, saturation, lightness] = rng.rand();

      const actual = `${hsl}(${toHueString(hue)}, ${toSaturationString(saturation)}, ${toLightnessString(lightness)})`;

      t.deepEqual(
        parse(actual).toJSON(),
        {
          type: "color",
          format: "hsl",
          hue: toHueJSON(hue),
          saturation: toSaturationJSON(saturation),
          lightness: toLightnessJSON(lightness),
          alpha: { type: "number", value: 1 },
        },
        `Failed to parse hsl color ${actual} with seed ${rng.seed} at iteration ${rng.iterations}`,
      );
    }
  },
  { rng: rng(0, 0), iterations: 10 },
);

test(
  "parse() accepts legacy syntax with percentages and alpha",
  (t, rng) => {
    for (const hsl of ["hsl", "hsla"]) {
      const [hue, saturation, lightness, alpha] = rng.rand();

      const actual = `${hsl}(${toHueString(hue)}, ${toSaturationString(saturation)}, ${toLightnessString(lightness)}, ${toString(alpha)})`;

      t.deepEqual(
        parse(actual).toJSON(),
        {
          type: "color",
          format: "hsl",
          hue: toHueJSON(hue),
          saturation: toSaturationJSON(saturation),
          lightness: toLightnessJSON(lightness),
          alpha: toJSON(alpha),
        },
        `Failed to parse hsl color ${actual} with seed ${rng.seed} at iteration ${rng.iterations}`,
      );
    }
  },
  { rng: rng(0, 0), iterations: 10 },
);

test("parse() accepts legacy syntax with no angle unit", (t) => {
  const expected: HSL.JSON = {
    type: "color",
    format: "hsl",
    hue: { type: "number", value: 0 },
    saturation: { type: "percentage", value: 1 },
    lightness: { type: "percentage", value: 1 },
    alpha: { type: "number", value: 1 },
  };

  for (const actual of [
    parse("hsl(0, 100%, 100%)"),
    parse("hsla(0, 100%, 100%)"),
    parse("hsl(0, 100%, 100%, 1)"),
    parse("hsla(0, 100%, 100%, 1)"),
  ]) {
    t.deepEqual(actual.toJSON(), expected);
  }
});

test(
  "parse() accepts modern syntax with number/percentage/none and no alpha",
  (t, rng) => {
    for (const hsl of ["hsl", "hsla"]) {
      const [hue, saturation, lightness] = rng.rand();

      const actual = `${hsl}(${toHueString(hue)} ${toSaturationString(saturation)} ${toLightnessString(lightness)})`;

      t.deepEqual(
        parse(actual).toJSON(),
        {
          type: "color",
          format: "hsl",
          hue: toHueJSON(hue),
          saturation: toSaturationJSON(saturation),
          lightness: toLightnessJSON(lightness),
          alpha: { type: "number", value: 1 },
        },
        `Failed to parse hsl color ${actual} with seed ${rng.seed} at iteration ${rng.iterations}`,
      );
    }
  },
  { rng: rng(0.1, 0.5), iterations: 10 },
);

test(
  "parse() accepts modern syntax with number/percentage/none and alpha",
  (t, rng) => {
    for (const hsl of ["hsl", "hsla"]) {
      const [hue, saturation, lightness, alpha] = rng.rand();

      const actual = `${hsl}(${toHueString(hue)} ${toSaturationString(saturation)} ${toLightnessString(lightness)} / ${toString(alpha)})`;

      t.deepEqual(
        parse(actual).toJSON(),
        {
          type: "color",
          format: "hsl",
          hue: toHueJSON(hue),
          saturation: toSaturationJSON(saturation),
          lightness: toLightnessJSON(lightness),
          alpha: toJSON(alpha),
        },
        `Failed to parse hsl color ${actual} with seed ${rng.seed} at iteration ${rng.iterations}`,
      );
    }
  },
  { rng: rng(0.1, 0.5), iterations: 10 },
);

test("parse() rejects numbers for saturation and lightness in legacy syntax", (t) => {
  for (const color of [
    "hsl(0, 100%, 1)",
    "hsl(0, 100%, 0, 1)",
    "hsl(0, 0, 100%)",
    "hsl(0, 1, 100%)",
    "hsl(0, 0, 100%)",
    "hsl(0, 100%, 1, 1)",
  ]) {
    t.deepEqual(parseErr(color).isErr(), true);
  }
});

test("parse() rejects `none` in legacy syntax", (t) => {
  for (const str of [
    "hsl(none, 255, 100)",
    "hsla(100, 255, none)",
    "hsla(100, none, 0)",
    "hsl(100, 255, 255, none)",
  ]) {
    t.deepEqual(parseErr(str).isErr(), true);
  }
});

test("parse() accepts calculations", (t) => {
  const expected = (type: "number" | "angle"): HSL.JSON => ({
    type: "color",
    format: "hsl",
    hue:
      type === "angle"
        ? { type: "angle", value: 0, unit: "deg" }
        : { type: "number", value: 0 },
    saturation: { type: "percentage", value: 1 },
    lightness: { type: "percentage", value: 0 },
    alpha: { type: "number", value: 0 },
  });

  for (const [actual, type] of [
    [parse("hsl(0 100% 0% / 0)"), "number"],
    [parse("hsla(0 100% 0% / calc(10 - 5 + 2*3 - 11)"), "number"],
    [parse("hsl(calc(3deg + 3deg - 6deg) 100% 0% / 0)"), "angle"],
    [parse("hsla(0, 100%, calc(0*2%), calc(1 + 1 + 2 - 2*2))"), "number"],
  ] as const) {
    t.deepEqual(actual.toJSON(), expected(type));
  }
});

test("#resolve() returns RBG color in percentages", (t) => {
  t.deepEqual(parse("hsl(0, 100%, 100%)").resolve().toJSON(), {
    type: "color",
    format: "rgb",
    red: { type: "percentage", value: 1 },
    green: { type: "percentage", value: 1 },
    blue: { type: "percentage", value: 1 },
    alpha: { type: "percentage", value: 1 },
  });
});
