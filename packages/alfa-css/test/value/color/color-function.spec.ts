import { RNGFactory } from "@siteimprove/alfa-rng";
import { test } from "@siteimprove/alfa-test";

import { ColorFunction, ColorSpaces } from "../../../dist/index.js";

import { parser, parserUnsafe } from "../../common/parse.js";

const parse = parserUnsafe(ColorFunction.parse);
const parseErr = parser(ColorFunction.parse);

const colorRNG = RNGFactory.of()
  // number rounded to 3 decimal places, gives percentages with up to 1 decimal.
  .map((num) => Math.round((num + Number.EPSILON) * 1000) / 1000)
  .group(4);
const typeRNG = RNGFactory.of()
  .map((x) => (x < 0.5 ? "number" : "percentage"))
  .group(4);
const rng = colorRNG.zip(typeRNG).create();

const toString = ([value, type]: [number, "number" | "percentage"]) =>
  type === "number" ? `${value}` : `${value * 100}%`;
const toJSON = ([value, type]: [number, "number" | "percentage"]) => ({
  type,
  value,
});

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
  { rng, iterations: 10 },
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
  { rng, iterations: 10 },
);
