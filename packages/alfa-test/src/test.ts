import { RNG } from "@siteimprove/alfa-rng";
import { assert, it, type TestOptions } from "vitest";

import type { Assertions } from "./types.js";

/**
 * @public
 */
export async function test<T = number>(
  name: string,
  assertion: (assert: Assertions, rng: RNG<T>) => void | Promise<void>,
  controller?: Partial<Controller<T>>,
): Promise<void> {
  // If the controlled is not overwritten, then T should be `number`.
  const fullController = {
    ...defaultController(),
    ...controller,
  } as Controller<T>;

  return it(name, fullController, async () => {
    for (let i = 0; i < fullController.iterations; i++) {
      await assertion(assert, fullController.rng);
    }
  });
}

/**
 * @public
 */
export interface Controller<T = number> extends TestOptions {
  rng: RNG<T>;
  iterations: number;
}

function defaultController(): Controller<number> {
  return { rng: RNG.standard().create(), iterations: 1 };
}
