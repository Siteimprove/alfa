import { Option } from "@siteimprove/alfa-option";

import { Command } from "../../../src/command";

import { Arguments } from "./audit/arguments";
import { Flags } from "./audit/flags";

/**
 * @internal
 */
export default (parent: Command) =>
  Command.withArguments(
    "audit",
    parent.version,
    "Perform an accessibility audit of a page.",
    Flags,
    Arguments,
    Option.of(parent),
    () => async (...args) => {
      const { run } = await import("./audit/run");
      return run(...args);
    }
  );
