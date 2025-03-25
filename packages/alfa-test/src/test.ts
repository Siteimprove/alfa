import { RNG } from "@siteimprove/alfa-rng";
import { assert, it } from "vitest";

import type { Assertions } from "./types.js";

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
 * @pulic
 *
 * A test that captures expected, but currently unimplemented or broken behavior.
 * The idea is that, when a bug or missing feature is reported, an `xfail` can be
 * written to reproduce the incorrect behavior, without failing the test suite.
 * When the behavior is eventually implemented, the `xfail` will fail and it can
 * then simply be converted to a real test. Preferably we would review `xfail`
 * tests periodically, implement the necessary change and convert them to real tests.
 *
 * Inspired by pytest:
 * {@link https://docs.pytest.org/en/stable/how-to/skipping.html#xfail-mark-test-functions-as-expected-to-fail}
 */
export async function xfail(
  name: string,
  assertion: (assert: Assertions) => void | Promise<void>,
): Promise<void> {
  it(name, async () => {
    try {
      await assertion(assert);
    } catch (e) {
      // Test failed as expected.
      return;
    }

    throw new Error(
      "Test passed, but was expected to fail. Please convert it from an `xfail` to a proper `test`.",
    );
  });
}
