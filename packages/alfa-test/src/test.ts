/// <reference types="node" />

import * as assert from "assert";

import { format } from "./format";
import { Controller, defaultController, RNG, seedableRNG } from "./rng";
import { Assertions } from "./types";

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
export async function test(
  name: string,
  assertion: (
    assert: Assertions,
    rng: RNG,
    seed: number,
  ) => void | Promise<void>,
  controller?: Partial<Controller>,
): Promise<void>;

/**
 * @internal
 */
export async function test(
  name: string,
  assertion: (
    assert: Assertions,
    rng: RNG,
    seed: number,
  ) => void | Promise<void>,
  notifier: Notifier,
  controller?: Partial<Controller>,
): Promise<void>;

export async function test(
  name: string,
  assertion: (
    assert: Assertions,
    rng: RNG,
    seed: number,
  ) => void | Promise<void>,
  notifierOrController?: Notifier | Partial<Controller>,
  controller?: Partial<Controller>,
): Promise<void> {
  const notifier: Notifier = isNotifier(notifierOrController)
    ? notifierOrController
    : defaultNotifier;
  const fullController: Controller = {
    ...defaultController,
    ...controller,
    ...notifierOrController,
  };
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
        fullController.wrapper(i, rng),
        seed,
      );
    }
  } catch (err) {
    const error = err as Error;

    notifier.error(`${format(name, error)}\n`);
  }
}
