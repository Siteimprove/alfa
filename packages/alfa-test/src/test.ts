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
    await assertion(assert);
  } catch (err) {
    console.error(format(name, err));
    process.exit(1);
  }
}
