import { Flag } from "@siteimprove/alfa-command";

import * as scrape from "../scrape/flags";

export const Flags = {
  help: Flag.help("Display the help information."),

  interactive: Flag.boolean(
    "interactive",
    "Whether or not to run an interactive audit."
  )
    .alias("i")
    .default(false),

  format: Flag.string("format", "The reporting format to use.")
    .type("format or package")
    .alias("f")
    .default("earl"),

  output: Flag.string(
    "output",
    `The path to write results to. If no path is provided, results are written
    to stdout.`
  )
    .type("path")
    .alias("o")
    .optional(),

  outcomes: Flag.string(
    "outcome",
    `The type of outcome to include in the results. If not provided, all types
    of outcomes are included. This flag can be repeated to include multiple
    types of outcomes.`
  )
    .choices("passed", "failed", "inapplicable", "cantTell")
    .repeatable()
    .optional(),

  ...scrape.Flags,
};
