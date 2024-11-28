import { assert, it } from "vitest";

import {
  type Controller,
  defaultController,
  type RNG,
  seedableRNG,
} from "./rng.js";

import type { Assertions } from "./types.js";

/**
 * @public
 */
export async function test<T = number>(
  name: string,
  assertion: (
    assert: Assertions,
    rng: RNG<T>,
    seed: number,
  ) => void | Promise<void>,
  controller?: Partial<Controller<T>>,
): Promise<void> {
  // If the controlled is not overwritten, then T should be number.
  const fullController = {
    ...defaultController,
    ...controller,
  } as Controller<T>;
  const seed = fullController.seed ?? Math.random();
  const rng = seedableRNG(seed);

  return it(name, async () => {
    for (let i = 0; i < fullController.iterations; i++) {
      await assertion(
        assert,
        // eta-expansion ensures that the wrapper is evaluated on each call of
        // the rng, not just once per iteration.
        () => fullController.wrapper(rng, i)(),
        seed,
      );
    }
  });
}
