import { RNG } from "@siteimprove/alfa-rng";
import { test } from "@siteimprove/alfa-test";

import { Comparable, Comparison } from "../dist/index.js";

test(
  "compareLexicographically compares couple of integers",
  (t, rng) => {
    const [a, b] = rng.rand();
    const [c, d] = rng.rand();

    t.deepEqual(
      Comparable.compareLexicographically<[number, number]>(
        [a, b],
        [c, d],
        [Comparable.compareNumber, Comparable.compareNumber],
      ),
      a < c
        ? Comparison.Less
        : a > c
          ? Comparison.Greater
          : b < d
            ? Comparison.Less
            : b > d
              ? Comparison.Greater
              : Comparison.Equal,
      `Failing lexicographic comparison of [${a}, ${b}] and [${c}, ${d}] at seed ${rng.seed} at iteration ${rng.iterations}`,
    );
  },
  {
    rng: RNG.integer().group(2).create(),
    iterations: 100,
  },
);

test("compareLexicographically compares heterogenous tuples", (t) => {
  const a: [number, string, string] = [1, "a", "a"];
  // nearly equal to force comparison go all the way.
  const b: [number, string, string] = [1, "a", "b"];

  t.deepEqual(
    Comparable.compareLexicographically(a, b, [
      Comparable.compareNumber,
      Comparable.compareString,
      Comparable.compareString,
    ]),
    Comparison.Less,
  );
});
