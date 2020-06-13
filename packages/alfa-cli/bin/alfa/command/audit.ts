import { Command } from "../../../src/command";

import { Arguments } from "./audit/arguments";
import { Flags } from "./audit/flags";

/**
 * @internal
 */
export default Command.of(
  "audit",
  "Perform an accessibility audit of a page.",
  Flags,
  Arguments,
  async (input) => {
    const { run } = await import("./audit/run");
    return run(input);
  }
);
