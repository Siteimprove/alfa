import { Command } from "../../../src/command";

import { Arguments } from "./scrape/arguments";
import { Flags } from "./scrape/flags";

/**
 * @internal
 */
export default Command.of(
  "scrape",
  "Scrape a page and output it in a serialisable format.",
  Flags,
  Arguments,
  async (input) => {
    const { run } = await import("./scrape/run");
    return run(input);
  }
);
