#!/usr/bin/env node

/// <reference types="node" />

import * as path from "path";
import * as process from "process";

import { None } from "@siteimprove/alfa-option";

import { Command } from "../src/command";
import { Flag } from "../src/flag";

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
    process.stdout.write(result.get());
  } else {
    process.stderr.write(result.getErr());
    process.exit(1);
  }
});
