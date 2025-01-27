/*
 * These tests use Vitest directly, because the alfa-test package that we use
 * elsewhere itself depends on alfa-rng for its randomness needs. So we have to
 * to avoid a circular dependency.
 */

import { assert, describe, it } from "vitest";
import { RNG, RNGFactory } from "../dist/rng.js";

describe("RNG.standard", () => {
  it("should generate random numbers between 0 and 1", () => {
    const rng = RNG.standard().create();

    for (let i = 0; i < 100; i++) {
      const value = rng.rand();

      assert.isAtLeast(
        value,
        0,
        `Generated ${value} with seed ${rng.seed} at iteration ${rng.iterations}`,
      );
      assert.isBelow(
        value,
        1,
        `Generated ${value} with seed ${rng.seed} at iteration ${rng.iterations}`,
      );
    }
  });

  it("should generate the same sequence of numbers with the same seed", () => {
    const seed = Math.random();
    const rng1 = RNG.standard(seed).create();
    const rng2 = RNG.standard(seed).create();

    for (let i = 0; i < 100; i++) {
      const value1 = rng1.rand();
      const value2 = rng2.rand();
      assert.equal(
        value1,
        value2,
        `Generated ${value1} with seed ${rng1.seed} at iteration ${rng1.iterations}, and ${value2} with seed ${rng2.seed} at iteration ${rng2.iterations}`,
      );
    }
  });

  it("should generate different sequences of numbers with different seeds", () => {
    const rng1 = RNG.standard().create();
    const rng2 = RNG.standard().create();

    let equals = 0;

    const maxIterations = 100;
    for (let i = 0; i < maxIterations; i++) {
      equals += rng1.rand() === rng2.rand() ? 1 : 0;
    }

    // Some numbers may be equals, we assume that the probability of 10% equals
    // numbers is very low; this test may still fail incorrectly.
    assert.isBelow(
      equals,
      maxIterations / 10,
      `Generated ${equals} equals numbers in ${maxIterations} iterations with seeds ${rng1.seed} and ${rng2.seed}`,
    );
  });
});

describe("RNGFactory#map", () => {
  it("should map result according to the given mapper", () => {
    const rng = RNGFactory.of()
      .map((value) => (value < 0.5 ? 0 : 1))
      .create();

    for (let i = 0; i < 100; i++) {
      const value = rng.rand();
      assert(
        value === 0 || value === 1,
        `Generated ${value} with seed ${rng.seed} at iteration ${rng.iterations}`,
      );
    }
  });
});

describe("RNGFactory#group", () => {
  it("should group results into an array", () => {
    const rng = RNGFactory.of().group(10).create();

    for (let i = 0; i < 100; i++) {
      const group = rng.rand();
      assert.equal(
        group.length,
        10,
        `Generated group of length ${group.length} with seed ${rng.seed} at iteration ${rng.iterations}`,
      );
    }
  });
});

describe("RNG.integer", () => {
  it("should generate random integers within bounds", () => {
    const rng = RNG.integer(10).create();

    for (let i = 0; i < 100; i++) {
      const value = rng.rand();
      assert.isAtLeast(
        value,
        0,
        `Generated ${value} with seed ${rng.seed} at iteration ${rng.iterations}`,
      );

      assert.isBelow(
        value,
        10,
        `Generated ${value} with seed ${rng.seed} at iteration ${rng.iterations}`,
      );

      assert(
        Number.isInteger(value),
        `Generated ${value} with seed ${rng.seed} at iteration ${rng.iterations}`,
      );
    }
  });
});

describe("RNG.hexString", () => {
  it("should generate random hex strings", () => {
    const rng = RNG.hexString(10).create();

    for (let i = 0; i < 100; i++) {
      const value = rng.rand();
      assert.match(
        value,
        /^[0-9a-f]{10}$/,
        `Generated ${value} with seed ${rng.seed} at iteration ${rng.iterations}`,
      );
    }
  });
});
