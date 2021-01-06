import { Flag } from "@siteimprove/alfa-command";

import * as scrape from "../scrape/flags";

export const Flags = {
  ...scrape.Flags,

  help: Flag.help("Display the help information."),

  output: Flag.string(
    "output",
    `The path to write results to. If no path is provided, results are written
    to stdout.`
  )
    .type("path")
    .alias("o")
    .optional(),

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

  outcomes: Flag.string(
    "outcome",
    `The type of outcome to include in the results. If not provided, all types
    of outcomes are included. This flag can be repeated to include multiple
    types of outcomes.`
  )
    .choices("passed", "failed", "inapplicable", "cantTell")
    .repeatable()
    .optional(),

  cpuProfile: Flag.string(
    "cpu-profile",
    `The path to write a CPU profile of the audit to. If no path is provided,
    no CPU profile is made.`
  )
    .type("path")
    .optional(),

  heapProfile: Flag.string(
    "heap-profile",
    `The path to write a heap profile of the audit to. If no path is provided,
    no heap profile is made.`
  )
    .type("path")
    .optional(),
};
