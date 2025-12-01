import { test } from "@siteimprove/alfa-test";

import { RGB } from "../../../dist/index.js";

import { parser, parserUnsafe } from "../../common/parse.js";
import { Component, rng } from "./common.js";

const parse = parserUnsafe(RGB.parse);
const parseErr = parser(RGB.parse);

const { toJSON, toString } = Component;

test(
  "parse() accepts legacy syntax with numbers and no alpha",
  (t, rng) => {
    for (const rgb of ["rgb", "rgba"]) {
      const [red, green, blue] = rng.rand();

      const actual = `${rgb}(${toString(red)}, ${toString(green)}, ${toString(blue)})`;

      t.deepEqual(
        parse(actual).toJSON(),
        {
          type: "color",
          format: "rgb",
          red: toJSON(red),
          green: toJSON(green),
          blue: toJSON(blue),
          alpha: { type: "number", value: 1 },
        },
        `Failed to parse rgb color ${actual} with seed ${rng.seed} at iteration ${rng.iterations}`,
      );
    }
  },
  { rng: rng(0, 1), iterations: 10 },
);

test(
  "parse() accepts legacy syntax with numbers and alpha",
  (t, rng) => {
    for (const rgb of ["rgb", "rgba"]) {
      const [red, green, blue, alpha] = rng.rand();

      const actual = `${rgb}(${toString(red)}, ${toString(green)}, ${toString(blue)}, ${toString(alpha)})`;

      t.deepEqual(
        parse(actual).toJSON(),
        {
          type: "color",
          format: "rgb",
          red: toJSON(red),
          green: toJSON(green),
          blue: toJSON(blue),
          alpha: toJSON(alpha),
        },
        `Failed to parse rgb color ${actual} with seed ${rng.seed} at iteration ${rng.iterations}`,
      );
    }
  },
  { rng: rng(0, 1), iterations: 10 },
);

test("parse() accepts exceeding whitespace", (t) => {
  for (const actual of [
    "rgba(  255,   255  , 255,     1)",
    "rgb(  255,   255  , 255,     1)",
    "rgba(  255   255   255 /     1)",
    "rgb(  255   255   255    /  1)",
  ]) {
    t.deepEqual(parse(actual).toJSON(), {
      type: "color",
      format: "rgb",
      red: { type: "number", value: 255 },
      green: { type: "number", value: 255 },
      blue: { type: "number", value: 255 },
      alpha: { type: "number", value: 1 },
    });
  }
});

test(
  "parse() accepts legacy syntax with percentages and no alpha",
  (t, rng) => {
    for (const rgb of ["rgb", "rgba"]) {
      const [red, green, blue] = rng.rand();

      const actual = `${rgb}(${toString(red)}, ${toString(green)}, ${toString(blue)})`;

      t.deepEqual(
        parse(actual).toJSON(),
        {
          type: "color",
          format: "rgb",
          red: toJSON(red),
          green: toJSON(green),
          blue: toJSON(blue),
          alpha: { type: "number", value: 1 },
        },
        `Failed to parse rgb color ${actual} with seed ${rng.seed} at iteration ${rng.iterations}`,
      );
    }
  },
  { rng: rng(0, 0), iterations: 10 },
);

test(
  "parse() accepts legacy syntax with percentages and alpha",
  (t, rng) => {
    for (const rgb of ["rgb", "rgba"]) {
      const [red, green, blue, alpha] = rng.rand();

      const actual = `${rgb}(${toString(red)}, ${toString(green)}, ${toString(blue)}, ${toString(alpha)})`;

      t.deepEqual(
        parse(actual).toJSON(),
        {
          type: "color",
          format: "rgb",
          red: toJSON(red),
          green: toJSON(green),
          blue: toJSON(blue),
          alpha: toJSON(alpha),
        },
        `Failed to parse rgb color ${actual} with seed ${rng.seed} at iteration ${rng.iterations}`,
      );
    }
  },
  { rng: rng(0, 0), iterations: 10 },
);

test(
  "parse() accepts modern syntax with numbers/percentage/none and no alpha",
  (t, rng) => {
    for (const rgb of ["rgb", "rgba"]) {
      const [red, green, blue] = rng.rand();

      const actual = `${rgb}(${toString(red)} ${toString(green)} ${toString(blue)})`;

      t.deepEqual(
        parse(actual).toJSON(),
        {
          type: "color",
          format: "rgb",
          red: toJSON(red),
          green: toJSON(green),
          blue: toJSON(blue),
          alpha: { type: "number", value: 1 },
        },
        `Failed to parse rgb color ${actual} with seed ${rng.seed} at iteration ${rng.iterations}`,
      );
    }
  },
  { rng: rng(0.1, 0.5), iterations: 10 },
);

test(
  "parse() accepts modern syntax with numbers/percentage/none and alpha",
  (t, rng) => {
    for (const rgb of ["rgb", "rgba"]) {
      const [red, green, blue, alpha] = rng.rand();

      const actual = `${rgb}(${toString(red)} ${toString(green)} ${toString(blue)} / ${toString(alpha)})`;

      t.deepEqual(
        parse(actual).toJSON(),
        {
          type: "color",
          format: "rgb",
          red: toJSON(red),
          green: toJSON(green),
          blue: toJSON(blue),
          alpha: toJSON(alpha),
        },
        `Failed to parse rgb color ${actual} with seed ${rng.seed} at iteration ${rng.iterations}`,
      );
    }
  },
  { rng: rng(0.1, 0.5), iterations: 10 },
);

test("parse() refuses mixing numbers and percentages in legacy syntax", (t) => {
  for (const str of ["rgba(100%, 255, 100)", "rgba(100, 255, 100%)"]) {
    t.deepEqual(parseErr(str).isErr(), true);
  }
});

test("parse() rejects `none` in legacy syntax", (t) => {
  for (const str of [
    "rgba(none, 255, 100)",
    "rgba(100, 255, none)",
    "rgba(100, none, 0)",
    "rgba(100, 255, 255, none)",
  ]) {
    t.deepEqual(parseErr(str).isErr(), true);
  }
});

test("#resolve() returns percentages", (t) => {
  const expected: RGB.JSON = {
    type: "color",
    format: "rgb",
    red: { type: "percentage", value: 1 },
    green: { type: "percentage", value: 1 },
    blue: { type: "percentage", value: 1 },
    alpha: { type: "percentage", value: 1 },
  };

  for (const actual of [
    parse("rgb(255, 255, 255)"),
    parse("rgba(255, 255, 255)"),
    parse("rgb(255, 255, 255, 1)"),
    parse("rgba(100%, 100%, 100%)"),
    parse("rgb(100%, 100%, 100%, 1)"),
    parse("rgba(255 255 255)"),
    parse("rgb(255 255 255 / 1)"),
    parse("rgba(100% 100% 100%)"),
    parse("rgb(100% 100% 100% / 1)"),
    parse("rgba(100% 100% 100%/  1)"),
  ]) {
    t.deepEqual(actual.resolve().toJSON(), expected);
  }
});

test("parse() accepts calculations", (t) => {
  const expected = (type: "number" | "percentage") =>
    ({
      type: "color",
      format: "rgb",
      red: { type: type, value: 0 },
      green: { type: type, value: type === "number" ? 255 : 1 },
      blue: { type: type, value: 0 },
      alpha: { type: "number", value: 0 },
    }) as RGB.JSON;

  for (const [actual, type] of [
    [parse("rgb(0% 100% 0% / 0)"), "percentage"],
    [parse("rgba(0 255 0 / calc(10 - 5 + 2*3 - 11)"), "number"],
    [parse("rgb(calc(3% + 3% - 6%) 100% 0% / 0)"), "percentage"],
    [parse("rgba(0 255 calc(0*2) / calc(1 + 1 + 2 - 2*2))"), "number"],
  ] as const) {
    t.deepEqual(actual.toJSON(), expected(type));
  }
});
