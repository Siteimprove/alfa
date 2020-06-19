#!/usr/bin/env node

/// <reference types="node" />

import * as path from "path";
import * as process from "process";

import { Command, Flag } from "@siteimprove/alfa-command";
import { None } from "@siteimprove/alfa-option";

import * as pkg from "../package.json";

import audit from "./alfa/command/audit";
import scrape from "./alfa/command/scrape";

const {
  argv: [node, bin],
  platform,
  arch,
  version,
} = process;

const application = Command.withSubcommands(
  path.basename(bin),
  `${pkg.name}/${pkg.version} ${platform}-${arch} node-${version}`,
  `The tool for all your accessibility needs on the command line.`,
  {
    help: Flag.help("Display the help information."),
    version: Flag.version("Output the current version."),
  },
  (self) => ({
    audit: audit(self),
    scrape: scrape(self),
  }),
  None
);

application.run(process.argv.slice(2)).then((result) => {
  if (result.isOk()) {
    let output = result.get().trimRight();

    if (output.length > 0) {
      process.stdout.write(output + "\n");
    }
  } else {
    let output = result.getErr().trimRight();

    if (output.length > 0) {
      process.stderr.write(output + "\n");
    }

    process.exit(1);
  }
});
