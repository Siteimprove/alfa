import { install } from "source-map-support";
import { Assertions } from "./types";
import { assert } from "./assert";
import { format } from "./format";

install();

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
