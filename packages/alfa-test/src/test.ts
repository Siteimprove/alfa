import * as assert from "assert";
import * as maps from "source-map-support";
import * as coverage from "./coverage";
import { format } from "./format";
import { Assertions } from "./types";

maps.install();
coverage.install();

export async function test(
  name: string,
  assertion: (assert: Assertions) => void | Promise<void>
): Promise<void> {
  try {
    await assertion("strict" in assert ? assert.strict : assert);
  } catch (err) {
    const error = err as Error;

    let message = error.message;

    if (error instanceof assert.AssertionError) {
      message = format(name, error);
    }

    process.stderr.write(`${message}\n`);
    process.exit(1);
  }
}
