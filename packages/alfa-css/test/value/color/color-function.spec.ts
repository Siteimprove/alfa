import { test } from "@siteimprove/alfa-test";

import { ColorFunction, ColorSpaces } from "../../../dist/index.js";

import { parserUnsafe } from "../../common/parse.js";
import { Component, rng } from "./common.js";

const colorRNG = rng();
const { toJSON, toString } = Component;

const parse = parserUnsafe(ColorFunction.parse);

test(
  "parse() accepts RGB color spaces with number or percentages and an Alpha value",
  (t, rng) => {
    for (const format of ColorSpaces) {
      const [c1, c2, c3, alpha] = rng.rand();

      const actual = `color(${format} ${toString(c1)} ${toString(c2)} ${toString(c3)} / ${toString(alpha)})`;

      t.deepEqual(
        parse(actual).toJSON(),
        {
          type: "color",
          format,
          c1: toJSON(c1),
          c2: toJSON(c2),
          c3: toJSON(c3),
          alpha: toJSON(alpha),
        },
        `Failed to parse color function ${actual} with seed ${rng.seed} at iteration ${rng.iterations}`,
      );
    }
  },
  { rng: colorRNG(0.1), iterations: 10 },
);

test(
  "parse() accepts RGB color spaces with number or percentages and no Alpha value",
  (t, rng) => {
    for (const format of ColorSpaces) {
      const [c1, c2, c3] = rng.rand();

      const actual = `color(${format} ${toString(c1)} ${toString(c2)} ${toString(c3)})`;

      t.deepEqual(
        parse(actual).toJSON(),
        {
          type: "color",
          format,
          c1: toJSON(c1),
          c2: toJSON(c2),
          c3: toJSON(c3),
          alpha: { type: "number", value: 1 },
        },
        `Failed to parse color function ${actual} with seed ${rng.seed} at iteration ${rng.iterations}`,
      );
    }
  },
  { rng: colorRNG(0.1), iterations: 10 },
);
