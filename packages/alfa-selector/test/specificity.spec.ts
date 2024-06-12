import { RNG, test } from "@siteimprove/alfa-test";

import { Specificity } from "../dist/specificity";
import { parse } from "./parser";

function wrapper(rng: RNG): RNG {
  // The max value for specificity components is 1024. Picking a "weird"
  // number that is slightly smaller than half to avoid overflows.
  return () => Math.floor(rng() * 487);
}

const controller = { iterations: 10, wrapper };

test(
  ".add() adds two specificities components-wise",
  (t, rng, seed) => {
    const [a1, b1, c1] = [rng(), rng(), rng()];
    const [a2, b2, c2] = [rng(), rng(), rng()];

    t.deepEqual(
      Specificity.sum(Specificity.of(a1, b1, c1), Specificity.of(a2, b2, c2)),
      Specificity.of(a1 + a2, b1 + b2, c1 + c2),
      `Problem with adding two specificities with seed ${seed} and ${controller.iterations} iterations`,
    );
  },
  controller,
);

test(
  ".max() maxes two specificities lexicographically",
  (t, rng, seed) => {
    const [a1, b1, c1] = [rng(), rng(), rng()];
    const [a2, b2, c2] = [rng(), rng(), rng()];

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
      `Problem with maxing two specificities with seed ${seed} and ${controller.iterations} iterations`,
    );
  },
  controller,
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
