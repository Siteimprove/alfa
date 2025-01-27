import { RNG } from "@siteimprove/alfa-rng";
import { assert, it } from "vitest";

import type { Assertions } from "./types.js";

/**
 * @public
 */
export async function test<T = number>(
  name: string,
  assertion: (assert: Assertions, rng: RNG<T>) => void | Promise<void>,
  controller?: Partial<Controller<T>>,
): Promise<void> {
  // If the controlled is not overwritten, then T should be number.
  const fullController = {
    ...defaultController(),
    ...controller,
  } as Controller<T>;

  return it(name, async () => {
    for (let i = 0; i < fullController.iterations; i++) {
      await assertion(
        assert,
        // eta-expansion ensures that the wrapper is evaluated on each call of
        // the rng, not just once per iteration.
        fullController.rng,
      );
    }
  });
}

/**
 * @public
 */
export interface Controller<T = number> {
  rng: RNG<T>;
  iterations: number;
}

function defaultController(): Controller<number> {
  return { rng: RNG.standard().create(), iterations: 1 };
}
