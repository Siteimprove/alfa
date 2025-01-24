import { RNG } from "@siteimprove/alfa-rng";
import { test } from "@siteimprove/alfa-test";

import { Specificity } from "../dist/specificity.js";
import { parse } from "./parser.js";

const controller = (seed?: number) => ({
  iterations: 10,
  // The max value for specificity components is 1024. Picking a "weird"
  // number that is slightly smaller than half to avoid overflows.
  rng: RNG.integer(487, seed),
});

test(
  ".add() adds two specificities components-wise",
  (t, rng) => {
    const [a1, b1, c1] = [rng.rand(), rng.rand(), rng.rand()];
    const [a2, b2, c2] = [rng.rand(), rng.rand(), rng.rand()];

    t.deepEqual(
      Specificity.sum(Specificity.of(a1, b1, c1), Specificity.of(a2, b2, c2)),
      Specificity.of(a1 + a2, b1 + b2, c1 + c2),
      `Problem with adding two specificities with seed ${rng.seed} at iteration ${rng.iterations}`,
    );
  },
  controller(),
);

test(
  ".max() maxes two specificities lexicographically",
  (t, rng) => {
    const [a1, b1, c1] = [rng.rand(), rng.rand(), rng.rand()];
    const [a2, b2, c2] = [rng.rand(), rng.rand(), rng.rand()];

    const specificity1 = Specificity.of(a1, b1, c1);
    const specificity2 = Specificity.of(a2, b2, c2);

    const max =
      a1 > a2
        ? specificity1
        : a2 > a1
          ? specificity2
          : b1 > b2
            ? specificity1
            : b2 > b1
              ? specificity2
              : c1 > c2
                ? specificity1
                : specificity2;

    t.deepEqual(
      Specificity.max(specificity1, specificity2),
      max,
      `Problem with maxing two specificities with seed ${rng.seed} at iteration ${rng.iterations}`,
    );
  },
  controller(),
);

test("Specificity of :is is correctly computed", (t) => {
  for (const [selector, a, b, c] of [
    [".foo, #bar.baz", 1, 1, 0],
    ["em, #foo", 1, 0, 0],
  ] as const) {
    const actual = parse(`:is(${selector})`).specificity;

    t.deepEqual(actual, Specificity.of(a, b, c), selector);
  }
});

test("Specificity of :not is correctly computed", (t) => {
  for (const [selector, a, b, c] of [
    [".foo, #bar.baz", 1, 1, 0],
    ["em, strong#foo", 1, 0, 1],
  ] as const) {
    const actual = parse(`:not(${selector})`).specificity;

    t.deepEqual(actual, Specificity.of(a, b, c), selector);
  }
});

test("Specificity of :has is correctly computed", (t) => {
  for (const [selector, a, b, c] of [
    [".foo, #bar.baz", 1, 1, 0],
    ["em, strong#foo", 1, 0, 1],
  ] as const) {
    const actual = parse(`:has(${selector})`).specificity;

    t.deepEqual(actual, Specificity.of(a, b, c), selector);
  }
});

test("Specificity of :where is correctly computed", (t) => {
  for (const [selector, a, b, c] of [
    [":where(.foo, #bar.baz)", 0, 0, 0],
    [".qux:where(em, #foo#bar#baz)", 0, 1, 0],
  ] as const) {
    const actual = parse(`${selector}`).specificity;

    t.deepEqual(actual, Specificity.of(a, b, c), selector);
  }
});
