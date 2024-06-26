/// <reference types="node" />

import * as assert from "assert";

import { format } from "./format.js";
import { Controller, defaultController, RNG, seedableRNG } from "./rng.js";
import { Assertions } from "./types.js";

/**
 * @internal
 */
export interface Notifier {
  error(message: string): void;
}

const defaultNotifier: Notifier = {
  error: (message) => {
    process.stderr.write(`${message}\n`);
    process.exit(1);
  },
};

// This is not super robust, but sufficient in our use case.
// Take care before using it elsewhere.
function isNotifier(value: unknown): value is Notifier {
  return typeof value === "object" && value !== null && "error" in value;
}

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
): Promise<void>;

/**
 * @internal
 */
export async function test<T = number>(
  name: string,
  assertion: (
    assert: Assertions,
    rng: RNG<T>,
    seed: number,
  ) => void | Promise<void>,
  notifier: Notifier,
  controller?: Partial<Controller<T>>,
): Promise<void>;

export async function test<T = number>(
  name: string,
  assertion: (
    assert: Assertions,
    rng: RNG<T>,
    seed: number,
  ) => void | Promise<void>,
  notifierOrController?: Notifier | Partial<Controller<T>>,
  controller?: Partial<Controller<T>>,
): Promise<void> {
  const notifier: Notifier = isNotifier(notifierOrController)
    ? notifierOrController
    : defaultNotifier;
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

  try {
    for (let i = 0; i < fullController.iterations; i++) {
      await assertion(
        "strict" in assert ? assert.strict : assert,
        // eta-expansion ensures that the wrapper is evaluated on each call of
        // the rng, not just once per iteration.
        () => fullController.wrapper(rng, i)(),
        seed,
      );
    }
  } catch (err) {
    const error = err as Error;

    notifier.error(`${format(name, error)}\n`);
  }
}
