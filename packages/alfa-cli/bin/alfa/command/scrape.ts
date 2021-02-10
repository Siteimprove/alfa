import { Command } from "@siteimprove/alfa-command";
import { Option } from "@siteimprove/alfa-option";

import { Arguments } from "./scrape/arguments";
import { Flags } from "./scrape/flags";

/**
 * @internal
 */
export default (parent: Command) =>
  Command.withArguments(
    "scrape",
    parent.version,
    "Scrape a page and output it in a serialisable format.",
    Flags,
    Arguments,
    Option.of(parent),
    () => async (...args) => {
      const { run } = await import("./scrape/run");
      return run(...args);
    }
  );
