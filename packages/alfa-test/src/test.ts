/// <reference types="node" />

import * as assert from "assert";

import { format } from "./format";
import { Assertions } from "./types";

/**
 * @internal
 */
export interface Notifier {
  error(message: string): void;
}

const defaultNotifier: Notifier = {
  error: message => {
    process.stderr.write(`${message}\n`);
    process.exit(1);
  }
};

export async function test(
  name: string,
  assertion: (assert: Assertions) => void | Promise<void>
): Promise<void>;

/**
 * @internal
 */
export async function test(
  name: string,
  assertion: (assert: Assertions) => void | Promise<void>,
  notifier: Notifier
): Promise<void>;

/**
 * @internal
 */
export async function test(
  name: string,
  assertion: (assert: Assertions) => void | Promise<void>,
  notifier = defaultNotifier
): Promise<void> {
  try {
    await assertion("strict" in assert ? assert.strict : assert);
  } catch (err) {
    const error = err as Error;

    notifier.error(`${format(name, error)}\n`);
  }
}
