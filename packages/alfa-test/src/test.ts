import { assert, it } from "vitest";

import {
  type Controller,
  defaultController,
  type RNG,
  seedableRNG,
} from "./rng.js";

/**
 * @internal
 */
export interface Notifier {
  error(message: string): void;
}

/**
 * @public
 */
export async function test<T = number>(
  name: string,
  assertion: (assert: any, rng: RNG<T>, seed: number) => void | Promise<void>,
  controller?: Partial<Controller<T>>,
): Promise<void>;

/**
 * @internal
 */
export async function test<T = number>(
  name: string,
  assertion: (assert: any, rng: RNG<T>, seed: number) => void | Promise<void>,
  notifier: Notifier,
  controller?: Partial<Controller<T>>,
): Promise<void>;

export async function test<T = number>(
  name: string,
  assertion: (assert: any, rng: RNG<T>, seed: number) => void | Promise<void>,
  notifierOrController?: Notifier | Partial<Controller<T>>,
  controller?: Partial<Controller<T>>,
): Promise<void> {
  // If the controlled is not overwritten, then T should be number.
  const fullController = {
    ...defaultController,
    ...controller,
    ...notifierOrController,
  } as Controller<T>;
  // "error" may have been copied over from the notifier.
  if ("error" in fullController) {
    delete fullController.error;
  }

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
