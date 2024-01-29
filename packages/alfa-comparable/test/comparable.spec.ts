import { type RNG, test } from "@siteimprove/alfa-test";
import { Comparable, Comparison } from "../src";

function wrapper(rng: RNG): RNG<[number, number]> {
  return () => [Math.round(rng() * 1000), Math.round(rng() * 1000)];
}

test(
  "compareLexicographically compares couple of integers",
  (t, rng, seed) => {
    const [a, b] = rng();
    const [c, d] = rng();

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
      `Failing lexicographic comparison of [${a}, ${b}] and [${c}, ${d}] at seed ${seed}`,
    );
  },
  { wrapper, iterations: 100 },
);

test("compareLexicographically compares heterogenous tuples", (t) => {
  const a: [number, string, string] = [1, "a", "a"];
  // nearly equal to force comparsion go all the way.
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
