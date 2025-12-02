import { Real } from "@siteimprove/alfa-math";
import { RNGFactory } from "@siteimprove/alfa-rng";
import { test } from "@siteimprove/alfa-test";

import { Format } from "../../../dist/value/color/format.js";
import { Number, Percentage } from "../../../dist/index.js";

// 4 numbers between bound and bound + 1000
const largeRNG = (bound: number) =>
  RNGFactory.of()
    .map((x) => Real.round(x * 1000 + bound + 0.0001))
    .group(4)
    .create();

// 4 numbers below 0.
const smallRNG = RNGFactory.of()
  .map((x) => Real.round(x * 1000 - 1000.0001))
  .group(4)
  .create();

// 4 numbers between 0 and max
const avgRNG = (max: number) =>
  RNGFactory.of()
    .map((x) => Real.round(x * max))
    .group(4)
    .create();

const actualPercent = (r: number, g: number, b: number, a: number) =>
  Format.resolve(
    Percentage.of(r),
    Percentage.of(g),
    Percentage.of(b),
    Percentage.of(a),
  );

const expected = (r: number, g: number, b: number, a: number) => [
  Percentage.of(r),
  Percentage.of(g),
  Percentage.of(b),
  Percentage.of(a),
];

const actualNumber = (r: number, g: number, b: number, a: number) =>
  Format.resolve(Number.of(r), Number.of(g), Number.of(b), Number.of(a));

test(
  ".resolve() clamps large percentages to 1",
  (t, rng) => {
    const [r, g, b, a] = rng.rand();

    t.deepEqual(actualPercent(r, g, b, a), expected(1, 1, 1, 1));
  },
  { rng: largeRNG(1) },
);

test(
  ".resolve() clamps small percentages to 0",
  (t, rng) => {
    const [r, g, b, a] = rng.rand();

    t.deepEqual(actualPercent(r, g, b, a), expected(0, 0, 0, 0));
  },
  { rng: smallRNG },
);

test(
  ".resolve() turns numbers into percentages to 255.",
  (t, rng) => {
    const [r, g, b, a] = rng.rand();

    t.deepEqual(
      actualNumber(r, g, b, a),
      expected(r / 255, g / 255, b / 255, 1),
    );
  },
  { rng: avgRNG(255) },
);

test(
  ".resolve() clamps large numbers to 100%",
  (t, rng) => {
    const [r, g, b, a] = rng.rand();

    t.deepEqual(actualNumber(r, g, b, a), expected(1, 1, 1, 1));
  },
  { rng: largeRNG(255) },
);

test(
  ".resolve() clamps small numbers to 0",
  (t, rng) => {
    const [r, g, b, a] = rng.rand();

    t.deepEqual(actualNumber(r, g, b, a), expected(0, 0, 0, 0));
  },
  { rng: smallRNG },
);
