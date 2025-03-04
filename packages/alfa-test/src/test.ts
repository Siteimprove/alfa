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
  // If the controlled is not overwritten, then T should be `number`.
  const fullController = {
    ...defaultController(),
    ...controller,
  } as Controller<T>;

  return it(
    name,
    async () => {
      for (let i = 0; i < fullController.iterations; i++) {
        await assertion(assert, fullController.rng);
      }
    },
    fullController?.timeout,
  );
}

/**
 * @public
 */
export interface Controller<T = number> {
  rng: RNG<T>;
  iterations: number;
  // This interface should instead extend Vitest's TestOptions.
  // However, doing so causes Vitest to be transitively included everywhere,
  // thus triggering https://github.com/vitejs/vite/issues/9813
  // Having one vitest.d.ts file in this package is OK, requiring one in every
  // dependent is not.
  // So, we just hardcode the property we need, until Vitest bug is fixed.
  timeout?: number;
}

function defaultController(): Controller<number> {
  return { rng: RNG.standard().create(), iterations: 1 };
}
